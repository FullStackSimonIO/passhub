import LoginCard from "@/components/LoginCard";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <h2 className="textfore py-8 text-4xl">Login:</h2>
      <LoginCard />
    </div>
  );
};

export default page;
