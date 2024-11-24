import React from "react";
import { BackgroundLines } from "./ui/animation";
import Header from "@/components/Header";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <BackgroundLines className="flex flex-col items-center justify-center">
      <div>
        <p className="text-8xl text-white">
          Welcome <span className="text-foreground"> to</span>
        </p>
      </div>
      <Header />
      <div className="flex items-center justify-center py-4 text-4xl">
        <h2 className="text-center text-white py-8">
          Your secure Password Manager coded in
          <span className="text-foreground"> Rust</span>
        </h2>
      </div>
      <div className="flex justify-center gap-8">
        <Button variant="default" size="lg">
          <a href="/login">Login</a>
        </Button>
        <Button variant="default" size="lg">
          <a href="/register">Register</a>
        </Button>
      </div>
    </BackgroundLines>
  );
};

export default Hero;
