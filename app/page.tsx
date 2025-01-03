import Diagram from "@/components/Diagram";
import Hero from "@/components/Hero";
import { LandingFeatures } from "@/components/LandingFeatures";
import React from "react";

const page = () => {
  return (
    <div id="container">
      <Hero />
      <LandingFeatures />
      <Diagram />
    </div>
  );
};

export default page;
