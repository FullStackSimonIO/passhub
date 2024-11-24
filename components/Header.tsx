import Image from "next/image";
import React from "react";

const Header = () => {
  return (
    <div className="flex items-center justify-center">
      <Image src="/assets/logo.svg" alt="Logo" width={500} height={300} />
    </div>
  );
};

export default Header;
