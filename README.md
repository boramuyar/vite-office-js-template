# Vite Office Add-in Template

A modern template for building Office Add-ins using Vite, React, TypeScript, and Tailwind CSS.

## Features

This Office Add-in template provides a modern, fast, and efficient development experience by leveraging Vite and a curated set of powerful libraries.

- **🚀 Blazing Fast Development with Vite:**

  - **Instant Server Start:** Enjoy near-instantaneous server startup and Hot Module Replacement (HMR) for a rapid development feedback loop.
  - **Optimized Builds:** Vite's Rollup-based build system produces highly optimized and smaller production bundles.
  - **Modern ESM Native:** Utilizes native ES modules during development, eliminating the need for heavy bundling in dev mode.

- **⚛️ Latest React 19:**

  - Build user interfaces with the newest features and improvements from React.
  - Leverage functional components and hooks for clean and maintainable UI code.

- **🔒 Type Safety with TypeScript:**

  - Develop with confidence using static typing to catch errors early and improve code quality and maintainability.
  - Enhanced code completion and refactoring capabilities in your IDE.

- **🎨 Styling with Tailwind CSS & Radix UI:**

  - **Tailwind CSS:** A utility-first CSS framework that allows for rapid UI development directly in your markup.
  - **Radix UI:** Provides unstyled, accessible, and highly customizable UI primitives to build your design system upon.
  - **`clsx` & `tailwind-merge`:** Utilities for conditionally joining class names and efficiently merging Tailwind CSS classes without style conflicts.

- **🔄 Efficient Data Handling with TanStack React Query:**

  - Powerful asynchronous state management for fetching, caching, synchronizing, and updating server state in your React applications.
  - Simplifies data fetching logic and provides features like caching, request de-duplication, and background updates.

- **📄 Client-Side Routing (Optional):**

  - Includes `react-router` for building complex multi-page UIs within your add-in if needed.

- **✨ Code Quality and Consistency:**

  - **ESLint:** Integrated for identifying and fixing problems in your JavaScript/TypeScript code, ensuring code quality and adherence to best practices.
  - **`eslint-plugin-office-addins`:** Specific linting rules for Office Add-in development.

- **🛠️ Office Add-in Development Toolkit:**

  - **`office-addin-debugging`:** Simplifies debugging your add-in across different Office clients.
  - **`office-addin-dev-certs`:** Manages development certificates for HTTPS.
  - **`custom-functions-metadata`:** Tooling for generating metadata for Excel custom functions if you plan to use them.

- **🌐 Internationalization Ready (Guidance):**

  - The template encourages the use of `react-intl` for internationalization, with a focus on statically evaluable message IDs for compile-time optimization.

- **🧪 Testing Foundation with Vitest:**
  - Includes `vitest`, a Vite-native unit test framework, for writing and running tests efficiently.

### Why use this template?

- **Modern Tooling:** Move away from older Webpack-based setups to a faster, more modern Vite-powered environment.
- **Developer Experience:** Enhanced DX with fast HMR, optimized builds, and strong typing.
- **Robust UI Development:** Leverage the power of React, Tailwind CSS, and Radix UI for building beautiful and accessible user interfaces.
- **Scalability:** Built with tools that support growing and complex add-in projects.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://your-repository-url/vite-addin.git
    cd vite-addin
    ```

2.  **Install dependencies:**
    Ensure you have Node.js and pnpm installed.

    ```bash
    pnpm install
    ```

3.  **Trust development certificates:**
    Office Add-ins require HTTPS. You'll need to trust the development certificates.

    ```bash
    pnpm start # This command often handles certs or guides you.
    # Alternatively, you might need a command like:
    # pnpm exec office-addin-dev-certs install
    ```

4.  **Start the development server and sideload the add-in:**

    ```bash
    pnpm dev  # Starts the Vite development server
    pnpm start # Sideloads the add-in into Office (e.g., Excel, Word)
    ```

    After running `pnpm run start`, follow the instructions in the terminal to open the Office application with your add-in loaded. The Vite dev server (`pnpm run dev`) will provide the add-in's web content with HMR.

    DO NOT FORGET TO RUN `pnpm stop` TO REMOVE SIDELOADED ADD-IN. As it won't be removed automatically.

## Available Scripts

In the project directory, you can run the following commands:

- **`pnpm run dev`**

  - Starts the Vite development server with Hot Module Replacement (HMR). This is used to serve your add-in's web content during development.

- **`pnpm run build`**

  - Compiles TypeScript (`tsc -b`) and then builds the application for production using Vite. The output is placed in the `dist` folder.

- **`pnpm run lint`**

  - Runs ESLint to analyze your code for potential errors and style issues.

- **`pnpm run start`**

  - Uses `office-addin-debugging` to start the Office application (e.g., Excel, Word) and sideload your add-in for testing and debugging. It typically uses the `manifest.xml` file.

- **`pnpm run stop`**

  - Uses `office-addin-debugging` to stop the Office application and remove the sideloaded add-in.

- **`pnpm run preview`**

  - Starts a local static web server to preview the production build from the `dist` folder. Useful for checking the built application before deployment.

- **`pnpm run auth`**
  - Executes the `./scripts/private-registry-setup.sh` script. This is likely used to configure authentication for a private npm registry if your project uses private packages.

## Custom Functions

This package includes a tool for generating metadata for Excel custom functions. Just define your custom functions in the `src/functions/functions.ts` file and start dev server or build the project to generate the metadata file.

Do not forget to associate functions with CustomFunctions runtime.

```typescript
CustomFunctions.associate("ADD", function (a, b) {
  return a + b;
});
```
