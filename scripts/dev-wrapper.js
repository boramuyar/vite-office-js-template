import { spawn, execSync } from "child_process";

let stopCommandExecuted = false;

// Function to execute the stop command
function runStopCommand(reasonSignalOrError) {
  if (stopCommandExecuted) {
    // If stop was already called, exit.
    // process.exit() might have already been called or will be soon by the initial call.
    return;
  }
  stopCommandExecuted = true;

  const reason =
    typeof reasonSignalOrError === "string" &&
    reasonSignalOrError.startsWith("SIG")
      ? `Received ${reasonSignalOrError}.`
      : reasonSignalOrError || "Unknown reason.";

  console.log(`\n${reason} Executing 'npm run stop' for cleanup...`);
  let stopError = null;
  try {
    execSync("npm run stop", { stdio: "inherit", shell: true });
    console.log("'npm run stop' executed successfully.");
  } catch (error) {
    console.error("Error during 'npm run stop':", error.message);
    stopError = error;
  } finally {
    // Exit with an error code if stop failed, otherwise with 0 or the original error code if applicable
    const exitCode = stopError
      ? stopError.status || 1
      : typeof reasonSignalOrError === "number"
        ? reasonSignalOrError
        : 0;
    console.log(`Wrapper script exiting with code ${exitCode}.`);
    process.exit(exitCode);
  }
}

// Handle termination signals for the wrapper script
["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, () => runStopCommand(signal));
});

// Global error handlers for the wrapper itself
process.on("uncaughtException", (err, origin) => {
  console.error(`\nUncaught Exception in wrapper (${origin}):`, err);
  runStopCommand(`Uncaught wrapper exception: ${err.message}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "\nUnhandled Rejection in wrapper at:",
    promise,
    "reason:",
    reason
  );
  runStopCommand(`Unhandled wrapper rejection: ${reason}`);
});

// Start the 'npm run start' process
console.log("Starting development server via 'npm run start'...");
const startProcess = spawn("npm", ["run", "start"], {
  stdio: "inherit",
  shell: true,
});

startProcess.on("error", (err) => {
  console.error("Failed to start 'npm run start' process:", err.message);
  // If the start command itself fails to spawn, attempt cleanup.
  runStopCommand(`'npm run start' failed to spawn: ${err.message}`);
});

startProcess.on("exit", (code, signal) => {
  console.log(
    `'npm run start' command process has exited with code ${code} and signal ${signal}.`
  );

  // If the start command process itself exits with an error or was killed by a signal
  if (code !== 0 && code !== null) {
    // code can be null if killed by signal
    console.log("The 'start' command process terminated with an error code.");
    runStopCommand(`'start' process error (code ${code}).`);
  } else if (signal) {
    console.log(
      `The 'start' command process was terminated by signal ${signal}.`
    );
    runStopCommand(`'start' process signal (${signal}).`);
  } else {
    // If 'npm run start' exits cleanly (code 0, no signal),
    // we assume it has launched a background dev server.
    // The wrapper will now wait for SIGINT/SIGTERM to run the stop command.
    console.log(
      "'npm run start' command completed. Assuming dev server is running in the background."
    );
    console.log(
      "Wrapper script is active. Press Ctrl+C to stop the server and run cleanup tasks."
    );
    // Keep the wrapper script alive. If we don't do this, and 'startProcess' has exited,
    // the wrapper itself would exit, and we wouldn't catch Ctrl+C for cleanup.
    // An alternative to process.stdin.resume() is a long setTimeout or setInterval,
    // but for a dev script, waiting for signals is the primary role after setup.
    // process.stdin.resume(); // This can sometimes interfere with child process stdio.
    // Relying on the Node event loop staying alive due to pending signal handlers.
    // If it exits prematurely, an explicit keep-alive like a no-op setInterval may be needed.
  }
});

// If the script reaches here and startProcess has exited cleanly,
// Node.js might exit if there are no other pending async operations or active handles.
// The signal handlers (process.on('SIGINT', ...)) should keep it alive.
// If not, uncommenting process.stdin.resume() or adding a dummy interval:
// setInterval(() => {}, 1 << 30); // Keeps process alive
