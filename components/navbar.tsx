"use client";

import {
  ChartColumn,
  CircleUserRound,
  DollarSign,
  Earth,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { HomeIcon } from "./icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const navItems = [
  { name: "Home", href: "home", icon: <HomeIcon size={20} /> },
  { name: "World of Stocks", href: "world", icon: <Earth size={20} /> },
  { name: "AI Chat", href: "/", icon: <Sparkles size={20} /> },
  { name: "Analytics", href: "graphs", icon: <ChartColumn size={20} /> },
  { name: "Money", href: "money", icon: <DollarSign size={20} /> },
  {
    name: "Contact",
    href: "#https://www.linkedin.com/in/toby-crust-a6a2a2245/",
    icon: <CircleUserRound size={20} />,
  },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.screenY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.addEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed z-40 mx-auto flex items-center justify-center rounded-lg border-1 border-border bg-background/80 transition-all duration-300",
        isScrolled ? "bg-background/80 py-3 shadow-xs backdrop-blur-md" : "p-4"
      )}
      style={{
        left: "50%",
        top: "20px",
        transform: "translateX(-50%)",
        width: "fit-content",
        maxWidth: "90vw",
      }}
    >
      <div className="flex items-center space-x-4">
        {navItems.map((item) => (
          <Tooltip key={item.name}>
            <TooltipTrigger asChild>
              <Link href={item.href}>{item.icon}</Link>
            </TooltipTrigger>
            <TooltipContent>{item.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </nav>
  );
};
