import { Outlet } from "react-router";

export const ErrorBoundary = () => {
  return <div>Something went wrong!</div>;
};

export default function Route() {
  return (
    <>
      <Outlet />
    </>
  );
}
