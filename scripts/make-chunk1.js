const fs = require("fs");
const path = require("path");

const p1 = `"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Palette,
  Layout,
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldCheck,
  Truck,
  Lock,
  Headset,
  Search,
  ShoppingCart,
  Heart,
  User,
  Store,
  HelpCircle,
  PhoneCall,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import {
  AppearanceSettingsDTO,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  HeaderConfig,
  FooterConfig,
  FooterColumn,
  deriveCssVariables,
} from "@/lib/appearance/appearance-repository";

type ActiveTab = "branding" | "header" | "footer" | "preview";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const PRESET_THEMES = [
  {
    id: "default-blue",
    name: "Modern Cadde (Default)",
    nameTr: "Modern Cadde (Varsayılan)",
    brandColor: "#2563eb",
    accentColor: "#f97316",
    borderRadius: "8px",
    fontHeading: "Inter",
    fontBody: "Inter",
    announcementBgColor: "#1e293b",
    announcementTextColor: "#f8fafc",
  },
  {
    id: "vibrant-orange",
    name: "Vibrant Marketplace",
    nameTr: "Canlı Pazaryeri (Turuncu)",
    brandColor: "#ea580c",
    accentColor: "#0284c7",
    borderRadius: "12px",
    fontHeading: "Plus Jakarta Sans",
    fontBody: "Plus Jakarta Sans",
    announcementBgColor: "#7c2d12",
    announcementTextColor: "#ffedd5",
  },
  {
    id: "emerald-retail",
    name: "Emerald & Eco",
    nameTr: "Zümrüt Yeşili & Eko",
    brandColor: "#059669",
    accentColor: "#f59e0b",
    borderRadius: "8px",
    fontHeading: "Outfit",
    fontBody: "Outfit",
    announcementBgColor: "#064e3b",
    announcementTextColor: "#ecfdf5",
  },
  {
    id: "royal-purple",
    name: "Luxury Boutique",
    nameTr: "Kraliyet Moru & Butik",
    brandColor: "#7c3aed",
    accentColor: "#ec4899",
    borderRadius: "16px",
    fontHeading: "Montserrat",
    fontBody: "Inter",
    announcementBgColor: "#4c1d95",
    announcementTextColor: "#f3e8ff",
  },
  {
    id: "slate-minimal",
    name: "Midnight Slate",
    nameTr: "Gece Mavisi Minimal",
    brandColor: "#0f172a",
    accentColor: "#38bdf8",
    borderRadius: "6px",
    fontHeading: "Inter",
    fontBody: "Inter",
    announcementBgColor: "#020617",
    announcementTextColor: "#e2e8f0",
  },
];

const FONT_OPTIONS = [
  "Inter",
  "Plus Jakarta Sans",
  "Outfit",
  "Poppins",
  "Roboto",
  "Montserrat",
  "Open Sans",
  "System-UI",
];

const RADIUS_OPTIONS = [
  { label: "None (0px)", value: "0px" },
  { label: "Small (4px)", value: "4px" },
  { label: "Medium (8px)", value: "8px" },
  { label: "Large (12px)", value: "12px" },
  { label: "Extra (16px)", value: "16px" },
  { label: "Pill (9999px)", value: "9999px" },
];
`;

fs.writeFileSync("scripts/page-chunk1.txt", p1, "utf8");
