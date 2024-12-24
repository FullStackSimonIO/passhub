import VaultFetcher from "@/components/VaultFetcher";
import VaultUploader from "@/components/VaultUploader";
import React from "react";

const page = () => {
  return (
    <div>
      <VaultUploader />
      <VaultFetcher />
    </div>
  );
};

export default page;
