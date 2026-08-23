"use client";

import React from "react";
import { MarketplaceHeader, MarketplaceHeaderProps } from "@/components/layout/marketplace-header";

export interface HeaderProps extends MarketplaceHeaderProps {}

export const Header: React.FC<HeaderProps> = (props) => {
  return <MarketplaceHeader {...props} />;
};

export default Header;
export * from "@/components/layout/marketplace-header";
