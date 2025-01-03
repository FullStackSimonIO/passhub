import Image from "next/image";
import React from "react";

const Diagram = () => {
  return (
    <section className="section flex flex-col items-center justify-center w-full h-screen">
      <div className="flex-col items-center justify-center py-4 text-10xl">
        <h2 className="flex items-center justify-center py-4">
          PassHub Encryption Flow
        </h2>
        <Image src="/assets/diagram.svg" width={1080} height={920} alt="test" />
      </div>
    </section>
  );
};

export default Diagram;
