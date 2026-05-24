"use client";

import Error from "../error";

export default function ErrorTestPage() {
  // Create a mock error to display on the page
  const mockError = new Error(
    "This is a simulated preview of the error page. Everything is working correctly!"
  );
  
  // Create a mock reset function
  const mockReset = () => {
    alert("The reset function was clicked! In production, this would re-render the page segment.");
  };

  return <Error error={mockError} reset={mockReset} />;
}
