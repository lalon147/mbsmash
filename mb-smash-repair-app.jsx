import React, { useState, useEffect, useRef } from 'react';
import { Menu, Home, Package, FileText, RotateCcw, BarChart3, Settings, Search, Plus, Check, X, Download, Upload, Camera } from 'lucide-react';

const PARTS_DATA = [
  {"id": 1, "registration": "1XS3FS", "part": "TAIL GATE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 2, "registration": "UNKNOWN", "part": "R BAR COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 3, "registration": "UNKNOWN", "part": "LPR COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 4, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 5, "registration": "UNKNOWN", "part": "RH TAIL LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 6, "registration": "UNKNOWN", "part": "RH TAIL GATE LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 7, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULDING", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 8, "registration": "U2765", "part": "BONET", "dealership": "PRESTON TOYOTA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 9, "registration": "UNKNOWN", "part": "COMPLETE FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 10, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 11, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 12, "registration": "UNKNOWN", "part": "BONET PROTECTOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 13, "registration": "UNKNOWN", "part": "FRONT RADAR MODULE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2025-08-21", "receivedDate": null, "notes": "Thursday Morning "},
  {"id": 14, "registration": "UNKNOWN", "part": "FRONT ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 15, "registration": "UNKNOWN", "part": "BONET HINGES", "dealership": "NOT SET", "status": "Ordered", "price": 2000.0, "orderDate": "2026-03-01", "expectedDate": "2025-08-21", "receivedDate": null, "notes": ""},
  {"id": 16, "registration": "UNKNOWN", "part": "Engine splash Tray", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 17, "registration": "UNKNOWN", "part": "ENERGY ABSORVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 18, "registration": "UNKNOWN", "part": "Lower Grill", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 19, "registration": "R2855", "part": "FRONT BAR", "dealership": "South Morang Haval", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 20, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 21, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 22, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 23, "registration": "UNKNOWN", "part": "RH GUARD LINER FRONT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 24, "registration": "UNKNOWN", "part": "RH BAR SLIDE FR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 25, "registration": "UNKNOWN", "part": "MAIN GRILL COMPLETE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 26, "registration": "1WX7CR", "part": "FRONT BAR", "dealership": "Norther Motor Group", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2025-08-19", "receivedDate": "Received", "notes": ""},
  {"id": 27, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 28, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 29, "registration": "UNKNOWN", "part": "CHROME MOULD ON TOP GRILL", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 30, "registration": "UNKNOWN", "part": "RH FR BAR SLIDE", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 31, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 32, "registration": "UNKNOWN", "part": "BONET", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 33, "registration": "UNKNOWN", "part": "RH RADIATOR SUPPORT TOP", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 34, "registration": "UNKNOWN", "part": "HORN", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 35, "registration": "UNKNOWN", "part": "CONDENSER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 36, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 37, "registration": "S806DDV", "part": "RH SIDE MIRROR GLASS", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 38, "registration": "UNKNOWN", "part": "INDICATOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 39, "registration": "1495M", "part": "FRONT BAR", "dealership": "Sss", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 40, "registration": "UNKNOWN", "part": "GUARD LH", "dealership": "Sss", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 41, "registration": "UNKNOWN", "part": "GUARD LINER LH", "dealership": "Sss", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 42, "registration": "7150M", "part": "REAR BAR", "dealership": "PT", "status": "Ordered", "price": 289.0, "orderDate": "2026-03-01", "expectedDate": "2025-08-22", "receivedDate": null, "notes": ""},
  {"id": 43, "registration": "UNKNOWN", "part": "RH BAR  SLIDE", "dealership": "PT", "status": "Ordered", "price": 121.0, "orderDate": "2026-03-01", "expectedDate": "2025-08-22", "receivedDate": null, "notes": ""},
  {"id": 44, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 791.0, "orderDate": "2026-03-01", "expectedDate": "2025-08-22", "receivedDate": null, "notes": ""},
  {"id": 45, "registration": "UNKNOWN", "part": "RH TAIL LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 46, "registration": "3433M", "part": "REAR BAR", "dealership": "Lexus Blackburn", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 47, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 48, "registration": "UNKNOWN", "part": "REAR BAR CHROME MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 49, "registration": "UNKNOWN", "part": "LOWER PART REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 50, "registration": "1OA1UZ", "part": "LH FRONT DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 51, "registration": "UNKNOWN", "part": "LH REAR DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 52, "registration": "UNKNOWN", "part": "LH SIDE SEAL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 53, "registration": "U2591", "part": "REAR BAR COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 54, "registration": "UNKNOWN", "part": "RH PANEL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 55, "registration": "1367M", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 56, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 57, "registration": "UNKNOWN", "part": "BONNET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 58, "registration": "UNKNOWN", "part": "TOP GRILL CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 59, "registration": "UNKNOWN", "part": "EMBLEM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 60, "registration": "UNKNOWN", "part": "RADIATOR SUPPORT LH,RH,TOP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 61, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 62, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 63, "registration": "UNKNOWN", "part": "RADIATOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 64, "registration": "2AS8FA", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 65, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 66, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 67, "registration": "UNKNOWN", "part": "LH FOG LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 68, "registration": "UNKNOWN", "part": "FOG LIGHT CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 69, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 70, "registration": "UNKNOWN", "part": "BONNET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 71, "registration": "UNKNOWN", "part": "LATCHE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 72, "registration": "UNKNOWN", "part": "TOP RADIATOR SUPPORT COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 73, "registration": "UNKNOWN", "part": "RADIATOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 74, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 75, "registration": "UNKNOWN", "part": "FAN", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 76, "registration": "UNKNOWN", "part": "LH AND RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 77, "registration": "1HK9LD", "part": "FRONT BAR COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 78, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 79, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 80, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 81, "registration": "0456PS", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 82, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 83, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 84, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 85, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 86, "registration": "UNKNOWN", "part": "RH TOP GRILL EXTENSION", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 87, "registration": "0120M", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 88, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 89, "registration": "U1938", "part": "REAR BAR", "dealership": "VOLVO PORT MEL", "status": "Ordered", "price": 1592.0, "orderDate": "2026-03-01", "expectedDate": "2025-08-28", "receivedDate": null, "notes": ""},
  {"id": 90, "registration": "UNKNOWN", "part": "L.P.R BAR", "dealership": "VOLVO PORT MELB", "status": "Ordered", "price": 200.0, "orderDate": "2026-03-01", "expectedDate": "2025-08-28", "receivedDate": null, "notes": ""},
  {"id": 91, "registration": "4546M", "part": "FRONT BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 92, "registration": "UNKNOWN", "part": "LOWER P FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 93, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 94, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 95, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 96, "registration": "UNKNOWN", "part": "LH FRONT GUARD MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 97, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 98, "registration": "UNKNOWN", "part": "FOG LIGHT COMPLETE WITH COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "01/09/", "receivedDate": null, "notes": ""},
  {"id": 99, "registration": "UNKNOWN", "part": "Absorver Holder", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 100, "registration": "UNKNOWN", "part": "Top radiator support", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 101, "registration": "UNKNOWN", "part": "Left radiator support", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 102, "registration": "UNKNOWN", "part": "Left two sensor with sensor bracket", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 103, "registration": "UNKNOWN", "part": "Fuse box cover", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 104, "registration": "UNKNOWN", "part": "Air cleaner box", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 105, "registration": "UNKNOWN", "part": "Bonet lock", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 106, "registration": "UNKNOWN", "part": "Headlight module LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 107, "registration": "M0453", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 108, "registration": "UNKNOWN", "part": "LEFT BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 109, "registration": "UNKNOWN", "part": "SPRR R BAR LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 110, "registration": "2CI5EW", "part": "FRONT BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 111, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 112, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 113, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 114, "registration": "UNKNOWN", "part": "LH LOWER BIT MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 115, "registration": "UNKNOWN", "part": "ENGINE COVER BOTTOM SPLASH TRAY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 116, "registration": "WXU886", "part": "REAR BAR", "dealership": "Sss", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 117, "registration": "UNKNOWN", "part": "LEFT QUARTER PANEL", "dealership": "PRESTON MAZDA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 118, "registration": "UNKNOWN", "part": "REAR LEFT DOOR", "dealership": "Arif city", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 119, "registration": "UNKNOWN", "part": "LEFT REAR GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 120, "registration": "CZH961", "part": "Front BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 121, "registration": "UNKNOWN", "part": "LH CHROME MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 122, "registration": "UNKNOWN", "part": "MAIN GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 123, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 124, "registration": "UNKNOWN", "part": "Top grill", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": ""},
  {"id": 125, "registration": "UNKNOWN", "part": "Tow cover", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 126, "registration": "UNKNOWN", "part": "Reinforcement", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 127, "registration": "UNKNOWN", "part": "Foam absorver", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 128, "registration": "UNKNOWN", "part": "Both bar slide", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 129, "registration": "2AV5ZK", "part": "FRONT LOWER", "dealership": "PT", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 130, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "PT", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 131, "registration": "UNKNOWN", "part": "LOWER REAR", "dealership": "PT", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 132, "registration": "UNKNOWN", "part": "FLAT REAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 133, "registration": "1ZK7GR", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 134, "registration": "UNKNOWN", "part": "BOOT LID", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 135, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 136, "registration": "UNKNOWN", "part": "BOTH REAR BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 137, "registration": "UNKNOWN", "part": "BACK PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 138, "registration": "UNKNOWN", "part": "RIGHT CHASIS RAILS", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 139, "registration": "UNKNOWN", "part": "QUATER PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 140, "registration": "UNKNOWN", "part": "TAIL LIGHT RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 141, "registration": "UNKNOWN", "part": "TRUNK FLOOR PAN", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 142, "registration": "UNKNOWN", "part": "BACK PANEL TRIM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 143, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 144, "registration": "UNKNOWN", "part": "WEATHER STRIP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 145, "registration": "UNKNOWN", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 146, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 147, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 148, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 149, "registration": "CZI843", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 150, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 151, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 152, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 153, "registration": "UNKNOWN", "part": "LH GRILL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 154, "registration": "UNKNOWN", "part": "FOAM ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 155, "registration": "UNKNOWN", "part": "ENGINE COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 156, "registration": "2380M", "part": "R BAR X 2", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 157, "registration": "UNKNOWN", "part": "TAIL GATE BADGES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 158, "registration": "UNKNOWN", "part": "CHROME MOULD R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 159, "registration": "M6387", "part": "R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 160, "registration": "UNKNOWN", "part": "RH TAIL LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 161, "registration": "6634M", "part": "BOOTLID", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 162, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 163, "registration": "UNKNOWN", "part": "LWR R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 164, "registration": "UNKNOWN", "part": "BACK PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 165, "registration": "UNKNOWN", "part": "BACK PANEL TRIM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 166, "registration": "UNKNOWN", "part": "WEATHER STRIP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 167, "registration": "UNKNOWN", "part": "REAR RIO", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 168, "registration": "2CV4UL", "part": "FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 169, "registration": "UNKNOWN", "part": "TOP MAIN GRILL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 170, "registration": "UNKNOWN", "part": "FR RIO", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 171, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 172, "registration": "UNKNOWN", "part": "RADIATOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 173, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 174, "registration": "UNKNOWN", "part": "BONET", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 175, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 176, "registration": "UNKNOWN", "part": "TOP RADIATOR SUPPORT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 177, "registration": "UNKNOWN", "part": "TOP RADIATOR SUPPORT", "dealership": "PT", "status": "Ordered", "price": 174.0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 178, "registration": "UNKNOWN", "part": "FR BOTH BAR SLIDE", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 179, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 180, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 181, "registration": "UNKNOWN", "part": "RH SENSOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 182, "registration": "UNKNOWN", "part": "VERTICAL MIDDLE BONET SUPPORT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 183, "registration": "UNKNOWN", "part": "BONNET RUBBER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 184, "registration": "UNKNOWN", "part": "HyBrid Cooler", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 185, "registration": "UNKNOWN", "part": "FOG LIGHT X2", "dealership": "PT ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 186, "registration": "UNKNOWN", "part": "RADIATOR HOSE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 187, "registration": "R2774", "part": "LH FRONT DOOR", "dealership": "ADIL", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 188, "registration": "UNKNOWN", "part": "LH REAR DOOR", "dealership": "ADIL", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 189, "registration": "UNKNOWN", "part": "FRONT BAR", "dealership": "PT", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 190, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "PT", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 191, "registration": "1RQ9EL", "part": "FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 192, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 193, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 194, "registration": "UNKNOWN", "part": "RH FOGLIGHT", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 195, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 196, "registration": "UNKNOWN", "part": "BOTH FR BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 197, "registration": "CCE919", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 198, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 199, "registration": "UNKNOWN", "part": "RH GRILL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 200, "registration": "UNKNOWN", "part": "FOAM ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 201, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 202, "registration": "UNKNOWN", "part": "FR BAR ENERGY ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 203, "registration": "UNKNOWN", "part": "BOTTOM ENGINE SPLASH TRAY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 204, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 205, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 206, "registration": "UNKNOWN", "part": "TOW COVER LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 207, "registration": "UNKNOWN", "part": "TOW COVER RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 208, "registration": "UNKNOWN", "part": "SHUTTER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 209, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 210, "registration": "BGN257", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 211, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 212, "registration": "1WJ6HT", "part": "BONET", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 213, "registration": "UNKNOWN", "part": "FRONT BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 214, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 215, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 216, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 217, "registration": "UNKNOWN", "part": "FOAM ABSORBER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 218, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 219, "registration": "XYU518", "part": "TAILGATE", "dealership": "ARIF", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 220, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 221, "registration": "UNKNOWN", "part": "RH SENSOR AND BRACKET", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 222, "registration": "UNKNOWN", "part": "MIDDLE LEFT SENSOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 223, "registration": "UNKNOWN", "part": "TWO MIDDLE SENSOR", "dealership": "RALPH", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 224, "registration": "UNKNOWN", "part": "SENSOR LOOM", "dealership": "RALPH", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 225, "registration": "UNKNOWN", "part": "SENSOR MODULE", "dealership": "RALPH", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 226, "registration": "CCF062", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 227, "registration": "UNKNOWN", "part": "LOWER PART FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 228, "registration": "UNKNOWN", "part": "MAIN GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 229, "registration": "UNKNOWN", "part": "BLACK MOULD ON THE GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 230, "registration": "R5026", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 231, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 232, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 233, "registration": "UNKNOWN", "part": "LH R DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 234, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 235, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 236, "registration": "UNKNOWN", "part": "WHEEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 237, "registration": "UNKNOWN", "part": "WHEEL CAP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 238, "registration": "UNKNOWN", "part": "Fuel Tank cover", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 239, "registration": "2382M", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 240, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 241, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 242, "registration": "UNKNOWN", "part": "FOG COVER WITH CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 243, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 244, "registration": "UNKNOWN", "part": "GUARD METAL BRACKET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 245, "registration": "UNKNOWN", "part": "BOTH FR BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 246, "registration": "UNKNOWN", "part": "RH REAR DOOR", "dealership": "Lexus blackburn", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 247, "registration": "UNKNOWN", "part": "ENGINE SPLASH TRAY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 248, "registration": "UNKNOWN", "part": "MAIN GRILL WITH CHROME MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 249, "registration": "2CK8MV", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 250, "registration": "UNKNOWN", "part": "FOG LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 251, "registration": "UNKNOWN", "part": "FOGLIGHT COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 252, "registration": "UNKNOWN", "part": "RH SENSOR BRACKET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 253, "registration": "UNKNOWN", "part": "RH SENSOR RUBBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 254, "registration": "R2890", "part": "RH TAIL LIGHT QUARTER PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 255, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 256, "registration": "1WH8XB", "part": "FR BAR", "dealership": "SOUTH MORANG", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 257, "registration": "UNKNOWN", "part": "RH FOG COVER WITH CHROME MOULD", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 258, "registration": "1TQ9VJ", "part": "R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 259, "registration": "1ZS8MF", "part": "R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 260, "registration": "UNKNOWN", "part": "LWR R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 261, "registration": "DNJ786", "part": "FR BAR", "dealership": "PT", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 262, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 263, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 264, "registration": "UNKNOWN", "part": "NUM PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 265, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 266, "registration": "2CC1DW", "part": "LEFT HAND FRONT DOOR", "dealership": "Adil", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 267, "registration": "UNKNOWN", "part": "LEFT HAND REAR DOOR", "dealership": "Adil", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 268, "registration": "UNKNOWN", "part": "CURTAIN AIRBAG", "dealership": "Adil", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 269, "registration": "UNKNOWN", "part": "ROOF LINER", "dealership": "Adil", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 270, "registration": "UNKNOWN", "part": "LEFT FRONT SEAT BELT", "dealership": "Adil", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 271, "registration": "UNKNOWN", "part": "LEFT REAR SEATBELT", "dealership": "Adil", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 272, "registration": "UNKNOWN", "part": "LEFT FRONT SEAT", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 273, "registration": "UNKNOWN", "part": "AIR BAG MODULE", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 274, "registration": "1YJ4CI", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 275, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 276, "registration": "UNKNOWN", "part": "FOG LIGHT LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 277, "registration": "UNKNOWN", "part": "FOG LIGHT COVER LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 278, "registration": "UNKNOWN", "part": "LWR FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 279, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 280, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 281, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD LH FRONT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 282, "registration": "UNKNOWN", "part": "8484047060/switch", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 283, "registration": "2147M", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 284, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 285, "registration": "UNKNOWN", "part": "NUM PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 286, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 287, "registration": "UNKNOWN", "part": "LWR REAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 288, "registration": "UNKNOWN", "part": "MIDDLE REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 289, "registration": "LIKESH", "part": "FRONT WINDSCREEN", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 290, "registration": "1044M", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 291, "registration": "UNKNOWN", "part": "LWR FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 292, "registration": "2DG7QZ", "part": "BOTH RH DOORS", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "Received", "notes": "1 door replace 1 repair"},
  {"id": 293, "registration": "UNKNOWN", "part": "BOTH WHEEL ARCH MOULDING", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 294, "registration": "UNKNOWN", "part": "COMPLETE SIDE MIRROR", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": "Outer cover repair"},
  {"id": 295, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 296, "registration": "M4537", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 297, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 298, "registration": "1QM6FU", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 299, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 300, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 301, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 302, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 303, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 304, "registration": "CSV241", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 305, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 306, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 307, "registration": "UNKNOWN", "part": "LH GRILL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 308, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 309, "registration": "UNKNOWN", "part": "BOTTOM ENGINE COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 310, "registration": "1768M", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 311, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 312, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 313, "registration": "UNKNOWN", "part": "RH WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 314, "registration": "UNKNOWN", "part": "RH FOG LIGHT COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 315, "registration": "U2496", "part": "FR BAR", "dealership": "Lexus Blackburn", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 316, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 317, "registration": "UNKNOWN", "part": "LH FOG COVER WITH CHROME", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 318, "registration": "UNKNOWN", "part": "LH SENSOR", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 319, "registration": "UNKNOWN", "part": "MAIN GRILL AND WHOLE MOULD", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 320, "registration": "UNKNOWN", "part": "BOTH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 321, "registration": "2DH1JG", "part": "FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 322, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 323, "registration": "1YP5CA", "part": "FR BAR", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 324, "registration": "UNKNOWN", "part": "TOP  GRILL", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 325, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 326, "registration": "UNKNOWN", "part": "NUM PLATE HOLDER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 327, "registration": "UNKNOWN", "part": "TOW COVER LH", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 328, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 329, "registration": "UNKNOWN", "part": "RH CHROME MOULD GRILL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 330, "registration": "UNKNOWN", "part": "HEADLIGHT RH", "dealership": "NEW", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 331, "registration": "UNKNOWN", "part": "ENGINE SPLASH TRAY", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 332, "registration": "UNKNOWN", "part": "SHOCK ABSORBER", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 333, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 334, "registration": "C0035", "part": "LH GUARD", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 335, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 336, "registration": "U2170", "part": "LH FRONT DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 337, "registration": "UNKNOWN", "part": "LH REAR DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 338, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 339, "registration": "2BK5HX", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 340, "registration": "M0440", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 341, "registration": "UNKNOWN", "part": "GRILL MOULD", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 342, "registration": "UNKNOWN", "part": "RH FOG LIGHT COVER", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 343, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "RECEIVED", "notes": ""},
  {"id": 344, "registration": "UNKNOWN", "part": "BOTTOM ENGINE COVER", "dealership": "NOT SET", "status": "Received", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": "NOT RECEIVED", "notes": ""},
  {"id": 345, "registration": "UNKNOWN", "part": "RH WHEEL CUP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 346, "registration": "UNKNOWN", "part": "R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 347, "registration": "UNKNOWN", "part": "REAR MUD FLAP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 348, "registration": "UNKNOWN", "part": "QUATER PANEL MOULD REAR RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 349, "registration": "UNKNOWN", "part": "REAR RH DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 350, "registration": "UNKNOWN", "part": "RH REAR DOOR MOULD BOTTOM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 351, "registration": "UNKNOWN", "part": "FRONT RH DOOR", "dealership": "Toylex", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 352, "registration": "UNKNOWN", "part": "DOOR MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 353, "registration": "UNKNOWN", "part": "REAR RH WHEEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 354, "registration": "6400M", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 355, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 356, "registration": "UNKNOWN", "part": "MIDDLE REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 357, "registration": "UNKNOWN", "part": "LH TAIL LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 358, "registration": "2AB8CB", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 359, "registration": "UNKNOWN", "part": "LOWR GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 360, "registration": "UNKNOWN", "part": "RH LOWER GRILL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 361, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 362, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 363, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 364, "registration": "R2377", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 365, "registration": "UNKNOWN", "part": "MAIN GRILL COMPLETE ALL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 366, "registration": "UNKNOWN", "part": "LWR FR BAR COMPLETE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 367, "registration": "UNKNOWN", "part": "RH WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 368, "registration": "UNKNOWN", "part": "RH SOCKER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 369, "registration": "UNKNOWN", "part": "WHEEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 370, "registration": "1NS2CL", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 371, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 372, "registration": "UNKNOWN", "part": "BOTTOM ENGINE COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 373, "registration": "CUA044", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 374, "registration": "M0995", "part": "FR BAR", "dealership": "Sss", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 375, "registration": "UNKNOWN", "part": "LH  and RH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 376, "registration": "UNKNOWN", "part": "BONET", "dealership": "Sss", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 377, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "Sss", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 378, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "Sss", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 379, "registration": "UNKNOWN", "part": "TOP RADIATOR SUPPORT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 380, "registration": "UNKNOWN", "part": "SMALL CONDENSOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 381, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 382, "registration": "UNKNOWN", "part": "FAN", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 383, "registration": "UNKNOWN", "part": "RADIATOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 384, "registration": "UNKNOWN", "part": "VERTICAL RADIATOR LEFT RIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 385, "registration": "UNKNOWN", "part": "HOOD LOCK", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 386, "registration": "UNKNOWN", "part": "HEADLIGHT BRACKET RH METAL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 387, "registration": "UNKNOWN", "part": "HINGES", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 388, "registration": "CCE900", "part": "BOOTLID", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 389, "registration": "UNKNOWN", "part": "BACK PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 390, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 391, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 392, "registration": "UNKNOWN", "part": "LWR R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 393, "registration": "UNKNOWN", "part": "WEATHER STRIP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 394, "registration": "UNKNOWN", "part": "BACK PANEL TRIM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 395, "registration": "UNKNOWN", "part": "BAR SLIDES BOTH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 396, "registration": "UNKNOWN", "part": "ANTENA ASSEMBLY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 397, "registration": "2AX1WV", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 398, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 399, "registration": "1VY6IP", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 400, "registration": "UNKNOWN", "part": "BOTH BAR SLIDED", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 401, "registration": "UNKNOWN", "part": "RH FR DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 402, "registration": "CMV356", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 403, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 404, "registration": "DEB134", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 405, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 406, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 407, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 408, "registration": "UNKNOWN", "part": "LWR FR MIDDLE BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 409, "registration": "UNKNOWN", "part": "TOW COVERX2", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 410, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 411, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 412, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 413, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 414, "registration": "UNKNOWN", "part": "TOP RADIATOR SUPPORT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 415, "registration": "UNKNOWN", "part": "WHELL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 416, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 417, "registration": "UNKNOWN", "part": "AIRBAG MODULE", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 418, "registration": "UNKNOWN", "part": "LOWER REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 419, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 420, "registration": "UNKNOWN", "part": "RH VERTICAL RADIATOR SUPPORT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 421, "registration": "UNKNOWN", "part": "BOTH CRASH CANS", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 422, "registration": "UNKNOWN", "part": "RH CHASIS", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 423, "registration": "UNKNOWN", "part": "AIRCON HOSE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 424, "registration": "UNKNOWN", "part": "FR SENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 425, "registration": "UNKNOWN", "part": "TOW HOOK COVER*2", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 426, "registration": "M9510", "part": "BOOTLID", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 427, "registration": "UNKNOWN", "part": "R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 428, "registration": "UNKNOWN", "part": "REAR RIO", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 429, "registration": "UNKNOWN", "part": "BACK PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 430, "registration": "UNKNOWN", "part": "WEATHER STRIP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 431, "registration": "UNKNOWN", "part": "BACK PANEL TRIM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 432, "registration": "1YA3DC", "part": "FR BAR", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 433, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 434, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 435, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 436, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 437, "registration": "UNKNOWN", "part": "ENGINE SPLASH TRAY", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 438, "registration": "UNKNOWN", "part": "GUARD LINER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 439, "registration": "UNKNOWN", "part": "ABSORBER FOAM", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 440, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 441, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 442, "registration": "UNKNOWN", "part": "BADGE", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 443, "registration": "UNKNOWN", "part": "WHEEL CAP", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 444, "registration": "UNKNOWN", "part": "LH FRONT DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 445, "registration": "UNKNOWN", "part": "LH FOG LIGHT COVER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 446, "registration": "UNKNOWN", "part": "AIR CLEANER INLET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 447, "registration": "UNKNOWN", "part": "LEFT HAND ANGLE HUB", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 448, "registration": "1KL4GC", "part": "RH GUARD", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 449, "registration": "UNKNOWN", "part": "RH FRONT DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 450, "registration": "UNKNOWN", "part": "RH REAR DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 451, "registration": "UNKNOWN", "part": "WHEEL DISC", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 452, "registration": "UNKNOWN", "part": "DOOR STRIPE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 453, "registration": "ARH513", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 454, "registration": "UNKNOWN", "part": "LWR REAR GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 455, "registration": "1593M", "part": "R BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 456, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 457, "registration": "1NT2WQ", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 458, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 459, "registration": "UNKNOWN", "part": "EMBLEM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 460, "registration": "UNKNOWN", "part": "TOP GRILL CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 461, "registration": "UNKNOWN", "part": "2X HEADLIGHT CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 462, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 463, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 464, "registration": "UNKNOWN", "part": "RADIATOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 465, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 466, "registration": "2899M", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 467, "registration": "UNKNOWN", "part": "RH FOG LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 468, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 469, "registration": "UNKNOWN", "part": "DRL RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 470, "registration": "2095M", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 471, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 472, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 473, "registration": "UNKNOWN", "part": "RH FR WHEEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 474, "registration": "UNKNOWN", "part": "BOTH FR BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 475, "registration": "UNKNOWN", "part": "WASHER BOTTLE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 476, "registration": "UNKNOWN", "part": "GUARD METAL BRACKET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 477, "registration": "UNKNOWN", "part": "GUARD LINER RH FR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 478, "registration": "2AX2UQ", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 479, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 480, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 481, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 482, "registration": "UNKNOWN", "part": "RH SENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 483, "registration": "2BC9QI", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 484, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD FR LEFT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 485, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 486, "registration": "UNKNOWN", "part": "SIDE MIRROR COVER PAINT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 487, "registration": "UNKNOWN", "part": "SIDE MIRROR BOTTOM COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 488, "registration": "UNKNOWN", "part": "LH REAR DOOR MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 489, "registration": "UNKNOWN", "part": "QUATER PANEL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 490, "registration": "UNKNOWN", "part": "FR LH WHEEL ALLOY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 491, "registration": "1QZ7D0", "part": "TAILGATE", "dealership": "ARIF", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 492, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "South MORANG", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 493, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "SOUTH MORANG", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 494, "registration": "1MY7VC", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 495, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 496, "registration": "UNKNOWN", "part": "REAR RIO", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 497, "registration": "1WC8RV", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 498, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 499, "registration": "0468M", "part": "FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-10", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 500, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 501, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 502, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 503, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 504, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 505, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 506, "registration": "UNKNOWN", "part": "ENGINE SPLASH TRAY", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 507, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 508, "registration": "UNKNOWN", "part": "WASHER BOTTLE", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 509, "registration": "UNKNOWN", "part": "BONET", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 510, "registration": "UNKNOWN", "part": "DRL RH", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 511, "registration": "UNKNOWN", "part": "TOP RADIATOR SUPPORT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 512, "registration": "UNKNOWN", "part": "RH HORIZONTAL RADIATOR SUPPORT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 513, "registration": "UNKNOWN", "part": "RH VERTICAL RADIATOR SUPPORT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 514, "registration": "UNKNOWN", "part": "RH GUARD BRACKET METAL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 515, "registration": "M9365", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-10", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 516, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 517, "registration": "UNKNOWN", "part": "TOW COVER LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 518, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 519, "registration": "CFM761", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-10", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 520, "registration": "1XU2UT", "part": "FR BAR COVER UPPER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-10", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 521, "registration": "UNKNOWN", "part": "MAIN GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 522, "registration": "UNKNOWN", "part": "RADIATOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 523, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 524, "registration": "UNKNOWN", "part": "BLOWER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 525, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 526, "registration": "UNKNOWN", "part": "CAP FRONT HOOK", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 527, "registration": "UNKNOWN", "part": "TOP RADIATOR COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 528, "registration": "UNKNOWN", "part": "HEADLIGHT RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 529, "registration": "UNKNOWN", "part": "LOWER CHROME MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 530, "registration": "UNKNOWN", "part": "AIR COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 531, "registration": "UNKNOWN", "part": "GARNISH NO 2", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 532, "registration": "R2886", "part": "TOP RADIATOR SUPPORT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-10", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 533, "registration": "UNKNOWN", "part": "LEFT RADIATOR SUPPORT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 534, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 535, "registration": "UNKNOWN", "part": "RH  GUARD", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 536, "registration": "UNKNOWN", "part": "BONET", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 537, "registration": "UNKNOWN", "part": "GRILL MAIN", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 538, "registration": "UNKNOWN", "part": "LH FRONT DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 539, "registration": "UNKNOWN", "part": "BOTH BONET HINGED", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 540, "registration": "UNKNOWN", "part": "FUSE BOX COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 541, "registration": "2AS6AR", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-10", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 542, "registration": "UNKNOWN", "part": "FOG LIGHT COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 543, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 544, "registration": "UNKNOWN", "part": "HEADLIGHT MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 545, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 546, "registration": "UNKNOWN", "part": "LOWER LIP RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 547, "registration": "UNKNOWN", "part": "LOWER LIP MIDDLE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 548, "registration": "UNKNOWN", "part": "BONET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 549, "registration": "2AN2WP", "part": "REAR LEFT DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-10", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 550, "registration": "UNKNOWN", "part": "MAIN GRILL", "dealership": "LEXUS BLACKBURN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 551, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 552, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 553, "registration": "3328M", "part": "REAR BAR", "dealership": "LEXUS", "status": "Ordered", "price": 0, "orderDate": "2025-11-11", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 554, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "LEXUS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 555, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 556, "registration": "UNKNOWN", "part": "LH FOG COVER COMPLETE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 557, "registration": "UNKNOWN", "part": "LH LOWER LIP MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 558, "registration": "UNKNOWN", "part": "LH SENSOR FRONT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 559, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 560, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 561, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 562, "registration": "CMA672", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-14", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 563, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 564, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 565, "registration": "UNKNOWN", "part": "LH GRILL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 566, "registration": "UNKNOWN", "part": "LH TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 567, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 568, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 569, "registration": "UNKNOWN", "part": "BONET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 570, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 571, "registration": "UNKNOWN", "part": "LH GUARD BRACKET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 572, "registration": "1NR9CL", "part": "BOOTLID", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2025-11-14", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 573, "registration": "UNKNOWN", "part": "BOOTLID LIGHT BOTH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 574, "registration": "UNKNOWN", "part": "EMBLEM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 575, "registration": "UNKNOWN", "part": "BOOTLID GARNISH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 576, "registration": "UNKNOWN", "part": "ALL REAR BADGES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 577, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 578, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 579, "registration": "UNKNOWN", "part": "TAIL LIGHTS BOTH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 580, "registration": "UNKNOWN", "part": "WEATHERSTRIP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 581, "registration": "UNKNOWN", "part": "BACKPANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 582, "registration": "UNKNOWN", "part": "BACKPANEL TRIM", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 583, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 584, "registration": "UNKNOWN", "part": "SENSOR BRACKETS BOTH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 585, "registration": "UNKNOWN", "part": "FLOOR PAN REAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 586, "registration": "UNKNOWN", "part": "2ND ACCIDENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 587, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 588, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 589, "registration": "2BP6HP", "part": "TAILGATE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 590, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 591, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 592, "registration": "UNKNOWN", "part": "MIDDLE FOG LAMP REAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 593, "registration": "1PW3IE", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-18", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 594, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 595, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 596, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 597, "registration": "UNKNOWN", "part": "FOAM ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 598, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 599, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 600, "registration": "UNKNOWN", "part": "TOYOTA EMBLEM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 601, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 602, "registration": "2332M", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 603, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 604, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 605, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 606, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 607, "registration": "2899M", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 608, "registration": "UNKNOWN", "part": "RH FOG LIGHT COMPLETE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 609, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 610, "registration": "1495M", "part": "QUATER PANEL LEFT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 611, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 612, "registration": "UNKNOWN", "part": "REAR LEFT DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 613, "registration": "UNKNOWN", "part": "RH SIDE MIRROR COMPLETE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 614, "registration": "R2553", "part": "TAILGATE", "dealership": "TOYLEX", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 615, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "LEXUS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 616, "registration": "UNKNOWN", "part": "BOTH TAIL LIGHTS", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 617, "registration": "UNKNOWN", "part": "TAILGATE GARNISH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 618, "registration": "UNKNOWN", "part": "ALL REAR BADGES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 619, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 620, "registration": "UNKNOWN", "part": "WEATHERSTRIP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 621, "registration": "UNKNOWN", "part": "FOAM ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 622, "registration": "UNKNOWN", "part": "BOTH CENTRE SENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 623, "registration": "UNKNOWN", "part": "4 SENSOR BRACKET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 624, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 625, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 626, "registration": "UNKNOWN", "part": "BACKPANEL TRIM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 627, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 628, "registration": "UNKNOWN", "part": "FR GRILL CHROME MOULD COMPLETE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 629, "registration": "XVR763", "part": "TAILGATE", "dealership": "ARIF", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 630, "registration": "UNKNOWN", "part": "REAR BUMPER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 631, "registration": "UNKNOWN", "part": "LWR RR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 632, "registration": "UNKNOWN", "part": "BACKPANEL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 633, "registration": "UNKNOWN", "part": "PAN FLOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 634, "registration": "1QW3IM", "part": "BONET", "dealership": "SSS", "status": "Ordered", "price": 300.0, "orderDate": "2026-11-20", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 635, "registration": "UNKNOWN", "part": "RADIATOR", "dealership": "ARIF", "status": "Ordered", "price": 165.0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 636, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "ARIF", "status": "Ordered", "price": 165.0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 637, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 638, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 639, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 640, "registration": "UNKNOWN", "part": "LH BAR MOULD", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 641, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 642, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 643, "registration": "UNKNOWN", "part": "TOP RADIATOR SUPOORT", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 644, "registration": "UNKNOWN", "part": "FORWARD TOP RADIATOR SUPPORT", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 645, "registration": "UNKNOWN", "part": "FR REINFORCEMENT", "dealership": "RALPH D SILVA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 646, "registration": "3672M", "part": "FR BAR", "dealership": "NORTHERN NISSAN", "status": "Ordered", "price": 0, "orderDate": "2025-11-20", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 647, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 648, "registration": "UNKNOWN", "part": "TOP GRILL WITH CHROME", "dealership": "NORTHERN NISSAN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 649, "registration": "UNKNOWN", "part": "NISSAN EMBLEM", "dealership": "NORTHERN NISSAN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 650, "registration": "UNKNOWN", "part": "LWR FR BAR CHROME", "dealership": "NORTHERN NISSAN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 651, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NORTHERN NISSAN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 652, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NORTHERN NISSAN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 653, "registration": "UNKNOWN", "part": "BAR SLIDE", "dealership": "NORTHERN NISSAN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 654, "registration": "UNKNOWN", "part": "LH FOG COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 655, "registration": "UNKNOWN", "part": "FOAM ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 656, "registration": "UNKNOWN", "part": "LH WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 657, "registration": "1KQ7AQ", "part": "FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2025-11-21", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 658, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "STOCK", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 659, "registration": "UNKNOWN", "part": "FOG LIGHT", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 660, "registration": "UNKNOWN", "part": "FOG COVER", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 661, "registration": "UNKNOWN", "part": "GUARD LINER", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 662, "registration": "UNKNOWN", "part": "WASHER BOTTLE", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 663, "registration": "3228M", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-27", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 664, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 665, "registration": "UNKNOWN", "part": "CHROME MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 666, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 667, "registration": "2CN1VZ", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 668, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 669, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 670, "registration": "UNKNOWN", "part": "BONET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 671, "registration": "UNKNOWN", "part": "BONET PROTECTOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 672, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 673, "registration": "UNKNOWN", "part": "LH GUARD METAL BRACKET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 674, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 675, "registration": "UNKNOWN", "part": "ENGINE SPLASH TRAY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 676, "registration": "ATT014", "part": "TOP GRILL", "dealership": "Sss", "status": "Ordered", "price": 0, "orderDate": "2025-12-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 677, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 678, "registration": "UNKNOWN", "part": "FR BUMPER BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 679, "registration": "UNKNOWN", "part": "NUM PLATE HOLDER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 680, "registration": "1T02VA", "part": "TAILGATE", "dealership": "ARIF", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 681, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 682, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 683, "registration": "UNKNOWN", "part": "REAR REFLECTORX2", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 684, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 685, "registration": "CUA082", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 686, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 687, "registration": "UNKNOWN", "part": "BOOTLID", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 688, "registration": "UNKNOWN", "part": "ALL REAR BADGED", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 689, "registration": "DEB260", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 690, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 691, "registration": "UNKNOWN", "part": "LH FOG COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 692, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 693, "registration": "UNKNOWN", "part": "LH HEADLIGHT MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 694, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 695, "registration": "UNKNOWN", "part": "NUMPLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 696, "registration": "UNKNOWN", "part": "BOTH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 697, "registration": "UNKNOWN", "part": "LOWER LIP MOULD 3 PIECES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 698, "registration": "1EN1KV", "part": "FRONT BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 699, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 700, "registration": "3881M", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 701, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 702, "registration": "1VY6GY", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 703, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 704, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 705, "registration": "2AX2UQ", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 706, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 707, "registration": "UNKNOWN", "part": "LWR GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 708, "registration": "UNKNOWN", "part": "RH FR SENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 709, "registration": "2AM3GJ", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-05", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 710, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 711, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 712, "registration": "1HR8IU", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-05", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 713, "registration": "UNKNOWN", "part": "LOWER REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 714, "registration": "R2016", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-05", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 715, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 716, "registration": "R2442", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-11-05", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 717, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 718, "registration": "UNKNOWN", "part": "FR RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 719, "registration": "UNKNOWN", "part": "RH FOG LIGHT COVER WITH CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 720, "registration": "R2377", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-12-08", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 721, "registration": "UNKNOWN", "part": "MAIN GRILL WITH COMPLETE CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 722, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 723, "registration": "UNKNOWN", "part": "RH TOW HOOK COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 724, "registration": "UNKNOWN", "part": "RH FR SENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 725, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 726, "registration": "UNKNOWN", "part": "BONET PROTECTOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 727, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "LEXUS BLACKBURN", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 728, "registration": "1VS7LC", "part": "WHEEL ALLOY X2", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 729, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD X2", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 730, "registration": "UNKNOWN", "part": "MUD FLAP X 2", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 731, "registration": "UNKNOWN", "part": "RH REAR DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 732, "registration": "UNKNOWN", "part": "RH FR DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 733, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 734, "registration": "WWG860", "part": "FR BAR", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 735, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 736, "registration": "JOYIA1", "part": "QUATER PANEL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 737, "registration": "UNKNOWN", "part": "DOOR MOULD BOTTOM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 738, "registration": "M3410", "part": "BONET", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 739, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 740, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 741, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 742, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 743, "registration": "UNKNOWN", "part": "FOG LAMP RH", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 744, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 745, "registration": "UNKNOWN", "part": "GUARD LINER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 746, "registration": "M1814", "part": "LH GUARD", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 747, "registration": "UNKNOWN", "part": "REAR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 748, "registration": "UNKNOWN", "part": "FR LH DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 749, "registration": "UNKNOWN", "part": "REAR LH DOOR", "dealership": "ADIL", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 750, "registration": "JOT003", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 751, "registration": "UNKNOWN", "part": "LWR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 752, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 753, "registration": "1XY1YZ", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 754, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 755, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 756, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 757, "registration": "UNKNOWN", "part": "LH AND RIGHT BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 758, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 759, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 760, "registration": "UNKNOWN", "part": "LWR FR CHROME MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 761, "registration": "1NL7VO", "part": "RH FR DOOR", "dealership": "ARIF", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 762, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "N HONDA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 763, "registration": "UNKNOWN", "part": "RH FR WHEEL", "dealership": "N HONDA", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 764, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 765, "registration": "UNKNOWN", "part": "BOOTLID", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 766, "registration": "UNKNOWN", "part": "REAR BADGES ALL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 767, "registration": "UNKNOWN", "part": "BOOTLID GARNISH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 768, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 769, "registration": "UNKNOWN", "part": "BACKPANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 770, "registration": "UNKNOWN", "part": "TOW HOOK COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 771, "registration": "UNKNOWN", "part": "RH BOOTLID LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 772, "registration": "1OT7RR", "part": "FR BAR", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 773, "registration": "UNKNOWN", "part": "LWR GRILL", "dealership": "SSS", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 774, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 775, "registration": "UNKNOWN", "part": "LH TOW COVER", "dealership": "PT", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 776, "registration": "2BW3ZE", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 777, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 778, "registration": "UNKNOWN", "part": "LWR GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 779, "registration": "UNKNOWN", "part": "NOSE PANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 780, "registration": "UNKNOWN", "part": "NUMBER PLATE HOLDER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 781, "registration": "UNKNOWN", "part": "ENGINE SPLASH TRAY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 782, "registration": "UNKNOWN", "part": "SHOCK ABSORBER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 783, "registration": "UNKNOWN", "part": "SHUTTER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 784, "registration": "UNKNOWN", "part": "CONDENSOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 785, "registration": "1VW1DI", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 786, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 787, "registration": "UNKNOWN", "part": "BONET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 788, "registration": "UNKNOWN", "part": "GUARD LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 789, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 790, "registration": "UNKNOWN", "part": "LH DRL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 791, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 792, "registration": "UNKNOWN", "part": "GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 793, "registration": "2BN4QB", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 794, "registration": "VIRK59", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 795, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 796, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 797, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 798, "registration": "0340M", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 799, "registration": "UNKNOWN", "part": "BAR SLIDE RH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 800, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 801, "registration": "UNKNOWN", "part": "EXTENTION REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 802, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 803, "registration": "UNKNOWN", "part": "SSS", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 804, "registration": "2AN1QS", "part": "APG", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 805, "registration": "UNKNOWN", "part": "SSS", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 806, "registration": "UNKNOWN", "part": "ADIL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 807, "registration": "1YL4OZ", "part": "330", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 808, "registration": "UNKNOWN", "part": "120", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 809, "registration": "UNKNOWN", "part": "180", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 810, "registration": "UNKNOWN", "part": "500", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 811, "registration": "UNKNOWN", "part": "221", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 812, "registration": "UNKNOWN", "part": "563", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 813, "registration": "UNKNOWN", "part": "200", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 814, "registration": "UNKNOWN", "part": "310", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 815, "registration": "UNKNOWN", "part": "115", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 816, "registration": "UNKNOWN", "part": "350", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 817, "registration": "UNKNOWN", "part": "110", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 818, "registration": "UNKNOWN", "part": "160", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 819, "registration": "UNKNOWN", "part": "100", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 820, "registration": "1RS2NT", "part": "APG", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 821, "registration": "UNKNOWN", "part": "APG", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 822, "registration": "UNKNOWN", "part": "PORT MELBOURNE VOLK", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 823, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 824, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 825, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 826, "registration": "U2502", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-03", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 827, "registration": "UNKNOWN", "part": "WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 828, "registration": "UNKNOWN", "part": "FOG COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 829, "registration": "UNKNOWN", "part": "FR BAR ARM EXT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 830, "registration": "UNKNOWN", "part": "LOWER LIP MOULD LH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 831, "registration": "1VW1DI", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 832, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 833, "registration": "UNKNOWN", "part": "LH TAIL LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 834, "registration": "UNKNOWN", "part": "RH TAIL LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 835, "registration": "UNKNOWN", "part": "RH BOOTLID LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 836, "registration": "UNKNOWN", "part": "BOOTLID GARNISH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 837, "registration": "UNKNOWN", "part": "REAR TOYOTA EMBLEM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 838, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 839, "registration": "UNKNOWN", "part": "BOTH REAR BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 840, "registration": "UNKNOWN", "part": "BACKPANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 841, "registration": "UNKNOWN", "part": "BACKPANEL TRIM", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 842, "registration": "2070M", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 843, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 844, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 845, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 846, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 847, "registration": "UNKNOWN", "part": "LWR GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 848, "registration": "ZKT005", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-12-29", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 849, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 850, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 851, "registration": "2147M", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2025-12-29", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 852, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 853, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 854, "registration": "UNKNOWN", "part": "RH WHEEL ARCH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 855, "registration": "UNKNOWN", "part": "RH GUARD LNR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 856, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 857, "registration": "UNKNOWN", "part": "LH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 858, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 859, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 860, "registration": "UNKNOWN", "part": "LH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 861, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 862, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 863, "registration": "UNKNOWN", "part": "FOG LIGHT CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 864, "registration": "UNKNOWN", "part": "TOW COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 865, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 866, "registration": "UNKNOWN", "part": "LH SIDE MIRROR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 867, "registration": "DEB260", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 868, "registration": "UNKNOWN", "part": "RH FR DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 869, "registration": "UNKNOWN", "part": "RH SIDE SKIRT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 870, "registration": "ZTK977", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 871, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 872, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 873, "registration": "1WS2NJ", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 874, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 875, "registration": "UNKNOWN", "part": "LWR REAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 876, "registration": "UNKNOWN", "part": "WEATHER STRIP", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 877, "registration": "M1747", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 878, "registration": "UNKNOWN", "part": "REAR REIN", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 879, "registration": "UNKNOWN", "part": "BOTH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 880, "registration": "UNKNOWN", "part": "BACKPANEL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 881, "registration": "UNKNOWN", "part": "BOOTLID", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 882, "registration": "3651M", "part": "TAILGATE ADJUSTMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 883, "registration": "UNKNOWN", "part": "RH FR DOOR ADJUSTMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 884, "registration": "UNKNOWN", "part": "POLISH REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 885, "registration": "UNKNOWN", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 886, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 887, "registration": "UNKNOWN", "part": "LH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 888, "registration": "6963M", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 889, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 890, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 891, "registration": "UNKNOWN", "part": "RH LWR GRILL CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 892, "registration": "UNKNOWN", "part": "LWR GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 893, "registration": "2AV5CA", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 894, "registration": "UNKNOWN", "part": "LH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 895, "registration": "UNKNOWN", "part": "LOWER GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 896, "registration": "UNKNOWN", "part": "LH LOWER GRILL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 897, "registration": "1KJ2YN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 898, "registration": "UNKNOWN", "part": "RH GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 899, "registration": "UNKNOWN", "part": "BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 900, "registration": "M6892", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 901, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 902, "registration": "M8767", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 903, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 904, "registration": "UNKNOWN", "part": "LWR REAR CHROME", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 905, "registration": "UNKNOWN", "part": "LH REFLECTOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 906, "registration": "UNKNOWN", "part": "REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 907, "registration": "UNKNOWN", "part": "BOTH REAR BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 908, "registration": "R2016", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 909, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 910, "registration": "1ZK9HZ", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 911, "registration": "UNKNOWN", "part": "RH HEADLIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 912, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 913, "registration": "UNKNOWN", "part": "RH BAR SLIDE", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 914, "registration": "CMV356", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 915, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 916, "registration": "C1084", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 917, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 918, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 919, "registration": "DFN645", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 920, "registration": "UNKNOWN", "part": "LWR REAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 921, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 922, "registration": "ATB294", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 923, "registration": "UNKNOWN", "part": "LWR REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 924, "registration": "UNKNOWN", "part": "REAR REINFORCEMENT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 925, "registration": "BAE154", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 926, "registration": "UNKNOWN", "part": "RH WHEEL ARCH", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 927, "registration": "1ZQ3N0", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 928, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 929, "registration": "UNKNOWN", "part": "WASHER MOTOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 930, "registration": "UNKNOWN", "part": "LH FOG LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 931, "registration": "UNKNOWN", "part": "LH FOGLIGHT COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 932, "registration": "1Y07DV", "part": "LH FR DOOR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 933, "registration": "1KJ2YN", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 934, "registration": "UNKNOWN", "part": "GUARD LINER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 935, "registration": "UNKNOWN", "part": "GUARD LINER BRACKET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 936, "registration": "1ZP6VT", "part": "LEFT TAIL LIGHT", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 937, "registration": "CAE240", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 938, "registration": "UNKNOWN", "part": "RH GUARD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 939, "registration": "U1752", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 940, "registration": "3881M", "part": "REAR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 941, "registration": "UNKNOWN", "part": "LWR REAR  BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 942, "registration": "UNKNOWN", "part": "LWR REAR CHROME MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 943, "registration": "1XW7GS", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 944, "registration": "C0118", "part": "BONET", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 945, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 946, "registration": "UNKNOWN", "part": "LWR GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 947, "registration": "U2552", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-01-28", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 948, "registration": "UNKNOWN", "part": "LWR FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 949, "registration": "UNKNOWN", "part": "BOTH BAR SLIDES", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 950, "registration": "UNKNOWN", "part": "LH TOW HOOK COVER", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 951, "registration": "UNKNOWN", "part": "MAIN GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 952, "registration": "UNKNOWN", "part": "LH WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 953, "registration": "UNKNOWN", "part": "RH WHEEL ARCH MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 954, "registration": "UNKNOWN", "part": "RH QUATER PANEL MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 955, "registration": "UNKNOWN", "part": "RH REAR DOOR MOULD", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 956, "registration": "1997B", "part": "FR BAR", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-01-29", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 957, "registration": "UNKNOWN", "part": "TOP GRILL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 958, "registration": "UNKNOWN", "part": "RH DRL", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""},
  {"id": 959, "registration": "UNKNOWN", "part": "ENGINE SPLASH TRAY", "dealership": "NOT SET", "status": "Ordered", "price": 0, "orderDate": "2026-03-01", "expectedDate": "2026-03-08", "receivedDate": null, "notes": ""}
];

export default function MBSmashRepairApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [parts, setParts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [returns, setReturns] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('claudeApiKey') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedInvoice, setExtractedInvoice] = useState(null);
  const fileInputRef = useRef(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [newVehicleReg, setNewVehicleReg] = useState('');
  const [newPartData, setNewPartData] = useState({
    registration: '',
    part: '',
    dealership: '',
    price: 0,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: ''
  });

  // Initialize with sample data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mbsr_parts');
      if (saved) {
        setParts(JSON.parse(saved));
      } else {
        setParts(PARTS_DATA);
      }
    } catch (e) {
      setParts(PARTS_DATA);
    }
  }, []);

  // Persist parts to localStorage whenever they change
  useEffect(() => {
    if (parts.length > 0) {
      try {
        localStorage.setItem('mbsr_parts', JSON.stringify(parts));
      } catch (e) {
        // storage full or unavailable; ignore
      }
    }
  }, [parts]);

  const handleApiKeySave = () => {
    localStorage.setItem('claudeApiKey', apiKey);
    alert('API Key saved!');
  };

  const addNewVehicle = () => {
    if (!newVehicleReg.trim()) {
      alert('Please enter a registration number');
      return;
    }
    // Just show success and close - actual part will be added next
    alert(`Vehicle ${newVehicleReg} registered! Now add a part for it.`);
    setNewVehicleReg('');
    setShowAddVehicle(false);
    setShowAddPart(true);
    setNewPartData({ ...newPartData, registration: newVehicleReg });
  };

  const addNewPart = () => {
    if (!newPartData.part.trim() || !newPartData.registration.trim()) {
      alert('Please fill in registration and part name');
      return;
    }
    
    const newPart = {
      id: Math.max(...parts.map(p => p.id), 0) + 1,
      registration: newPartData.registration,
      part: newPartData.part,
      dealership: newPartData.dealership || 'NOT SET',
      status: 'Ordered',
      price: newPartData.price || 0,
      orderDate: newPartData.orderDate,
      expectedDate: newPartData.expectedDate,
      receivedDate: null,
      notes: ''
    };
    
    setParts([...parts, newPart]);
    alert(`Part added: ${newPart.part} for ${newPart.registration}`);
    setShowAddPart(false);
    setNewPartData({
      registration: '',
      part: '',
      dealership: '',
      price: 0,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: ''
    });
    setCurrentScreen('inventory');
  };

  const handleInvoiceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !apiKey) {
      alert('Please add API key first');
      return;
    }

    setLoading(true);
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64
                }
              },
              {
                type: 'text',
                text: `Extract invoice data. Return ONLY valid JSON:
{
  "invoiceDate": "YYYY-MM-DD",
  "invoiceNumber": "string",
  "dealership": "string",
  "totalAmount": number,
  "items": [
    {
      "partName": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ]
}`
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
      const invoiceData = JSON.parse(cleanJson);
      setExtractedInvoice(invoiceData);
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const saveExtractedInvoice = () => {
    if (!extractedInvoice) return;
    const newInvoice = {
      id: Date.now(),
      ...extractedInvoice,
      savedDate: new Date().toLocaleDateString()
    };
    setInvoices([...invoices, newInvoice]);
    setExtractedInvoice(null);
    alert('Invoice saved!');
    setCurrentScreen('invoice-history');
  };

  const markPartReceived = (id) => {
    setParts(parts.map(p => p.id === id ? { ...p, status: 'Received', receivedDate: new Date().toLocaleDateString() } : p));
  };

  const markPartReturn = (id) => {
    setParts(parts.map(p => p.id === id ? { ...p, status: 'Return' } : p));
  };

  const getDashboardMetrics = () => {
    const total = parts.length;
    const received = parts.filter(p => p.status === 'Received').length;
    const pending = parts.filter(p => p.status === 'Ordered').length;
    const overdue = parts.filter(p => {
      if (p.status === 'Received') return false;
      const expected = new Date(p.expectedDate);
      return expected < new Date();
    }).length;
    const totalCost = parts.reduce((sum, p) => sum + (p.price || 0), 0);

    return { total, received, pending, overdue, totalCost };
  };

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.part.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.dealership.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const metrics = getDashboardMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">MB SMASH REPAIR</h1>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-white/10 rounded">
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="bg-blue-700 border-t border-cyan-400 px-4 py-3 flex gap-2 flex-wrap">

            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'invoice-scanner', label: 'Invoice', icon: Camera },
              { id: 'invoice-history', label: 'History', icon: FileText },
              { id: 'returns', label: 'Returns', icon: RotateCcw },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentScreen(item.id); setMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded transition ${
                    currentScreen === item.id ? 'bg-cyan-400/20 text-cyan-100' : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* DASHBOARD */}
        {currentScreen === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-6 rounded-lg border border-cyan-400/30 bg-cyan-900/10 hover:bg-cyan-900/20 transition">
                <p className="text-cyan-400 text-sm font-semibold mb-2">Total Parts</p>
                <p className="text-4xl font-bold text-white">{metrics.total}</p>
              </div>
              <div className="p-6 rounded-lg border border-blue-400/30 bg-blue-900/10 hover:bg-blue-900/20 transition">
                <p className="text-blue-400 text-sm font-semibold mb-2">Received</p>
                <p className="text-4xl font-bold text-white">{metrics.received}</p>
              </div>
              <div className="p-6 rounded-lg border border-cyan-400/30 bg-cyan-900/10 hover:bg-cyan-900/20 transition">
                <p className="text-cyan-400 text-sm font-semibold mb-2">Pending</p>
                <p className="text-4xl font-bold text-white">{metrics.pending}</p>
              </div>
              <div className="p-6 rounded-lg border border-blue-400/30 bg-blue-900/10 hover:bg-blue-900/20 transition">
                <p className="text-blue-400 text-sm font-semibold mb-2">Overdue</p>
                <p className="text-4xl font-bold text-white">{metrics.overdue}</p>
              </div>
              <div className="p-6 rounded-lg border border-cyan-400/30 bg-cyan-900/10 hover:bg-cyan-900/20 transition">
                <p className="text-cyan-400 text-sm font-semibold mb-2">Total Cost</p>
                <p className="text-2xl font-bold text-white">${metrics.totalCost}</p>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-blue-400/30 bg-blue-900/10">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Received Rate:</span>
                  <span className="text-cyan-400 font-bold">{metrics.total > 0 ? Math.round(metrics.received / metrics.total * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Average Cost per Part:</span>
                  <span className="text-blue-400 font-bold">${(metrics.total > 0 ? (metrics.totalCost / metrics.total).toFixed(2) : 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {currentScreen === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-cyan-300">Master Inventory</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition text-white font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Vehicle
                </button>
                <button
                  onClick={() => setShowAddPart(true)}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition text-white font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Part
                </button>
              </div>
            </div>

            {/* ADD VEHICLE MODAL */}
            {showAddVehicle && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-6 rounded-lg border border-cyan-400/30 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4 text-cyan-300">Add New Vehicle</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Vehicle Registration</label>
                      <input
                        type="text"
                        value={newVehicleReg}
                        onChange={(e) => setNewVehicleReg(e.target.value)}
                        placeholder="e.g., 1XS3FS, ABC123"
                        className="w-full px-3 py-2 bg-slate-700 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={addNewVehicle}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg text-white font-semibold"
                      >
                        Add Vehicle
                      </button>
                      <button
                        onClick={() => setShowAddVehicle(false)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADD PART MODAL */}
            {showAddPart && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-6 rounded-lg border border-blue-400/30 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4 text-blue-300">Add New Part</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-300">Vehicle Registration *</label>
                      <input
                        type="text"
                        value={newPartData.registration}
                        onChange={(e) => setNewPartData({...newPartData, registration: e.target.value})}
                        placeholder="e.g., 1XS3FS"
                        className="w-full px-3 py-2 bg-slate-700 border border-blue-400/30 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-300">Part Name *</label>
                      <input
                        type="text"
                        value={newPartData.part}
                        onChange={(e) => setNewPartData({...newPartData, part: e.target.value})}
                        placeholder="e.g., FRONT BAR, TAIL GATE"
                        className="w-full px-3 py-2 bg-slate-700 border border-blue-400/30 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-300">Dealership</label>
                      <input
                        type="text"
                        value={newPartData.dealership}
                        onChange={(e) => setNewPartData({...newPartData, dealership: e.target.value})}
                        placeholder="e.g., PT, SSS, ARIF"
                        className="w-full px-3 py-2 bg-slate-700 border border-blue-400/30 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-300">Price</label>
                      <input
                        type="number"
                        value={newPartData.price}
                        onChange={(e) => setNewPartData({...newPartData, price: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-slate-700 border border-blue-400/30 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-300">Order Date</label>
                      <input
                        type="date"
                        value={newPartData.orderDate}
                        onChange={(e) => setNewPartData({...newPartData, orderDate: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-700 border border-blue-400/30 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-300">Expected Delivery</label>
                      <input
                        type="date"
                        value={newPartData.expectedDate}
                        onChange={(e) => setNewPartData({...newPartData, expectedDate: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-700 border border-blue-400/30 rounded-lg text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={addNewPart}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-semibold"
                      >
                        Add Part
                      </button>
                      <button
                        onClick={() => setShowAddPart(false)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by part, registration, or dealership..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {['all', 'Ordered', 'Received', 'Return'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg transition ${
                      filterStatus === status
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                        : 'border border-slate-600 hover:bg-slate-700 text-gray-300'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredParts.length > 0 ? (
                filteredParts.map(part => (
                  <div key={part.id} className="p-4 rounded-lg border border-slate-600 bg-slate-800 hover:border-cyan-400 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg text-cyan-300">{part.part}</p>
                        <p className="text-gray-400 text-sm">
                          {part.registration} • {part.dealership}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        part.status === 'Received' ? 'bg-blue-500/20 text-blue-300' :
                        part.status === 'Ordered' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-slate-600 text-gray-300'
                      }`}>
                        {part.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="text-cyan-300 font-bold">${part.price}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expected</p>
                        <p className="text-blue-300">{part.expectedDate}</p>
                      </div>
                      {part.receivedDate && (
                        <div>
                          <p className="text-gray-500">Received</p>
                          <p className="text-blue-300 font-bold">{part.receivedDate}</p>
                        </div>
                      )}
                    </div>

                    {part.status === 'Ordered' && (
                      <button
                        onClick={() => markPartReceived(part.id)}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-white font-semibold"
                      >
                        <Check className="w-4 h-4" />
                        Mark Received
                      </button>
                    )}
                    {part.status !== 'Return' && (
                      <button
                        onClick={() => markPartReturn(part.id)}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 text-white font-semibold"
                      >
                        <X className="w-4 h-4" />
                        Mark for Return
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No parts found</p>
              )}
            </div>
          </div>
        )}

        {/* INVOICE SCANNER */}
        {currentScreen === 'invoice-scanner' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">Invoice Scanner</h2>

            {!apiKey && (
              <div className="bg-pink-500/20 border-2 border-pink-400 p-4 rounded-lg" style={{boxShadow: '0 0 15px rgba(255, 20, 147, 0.4)'}}>
                <p className="text-pink-300">⚠️ Please add your Claude API key in Settings first</p>
              </div>
            )}

            <div className="bg-black p-8 rounded-lg border-2 border-dashed border-cyan-500 text-center cursor-pointer hover:bg-cyan-500/5 transition" style={{boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)'}}
              onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-12 h-12 mx-auto mb-4 text-cyan-400" style={{textShadow: '0 0 10px rgba(0, 212, 255, 0.8)'}} />
              <p className="text-xl font-semibold mb-2 text-cyan-300">Upload Invoice Photo</p>
              <p className="text-purple-400">Click or drag to upload JPG/PNG</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInvoiceUpload}
                disabled={!apiKey}
                className="hidden"
              />
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-cyan-600 border-t-cyan-300 rounded-full"></div>
                </div>
                <p className="mt-4 text-cyan-300">Scanning invoice...</p>
              </div>
            )}

            {extractedInvoice && (
              <div className="bg-black p-6 rounded-lg border-2 border-lime-500" style={{boxShadow: '0 0 20px rgba(0, 255, 127, 0.4)'}}>
                <h3 className="text-xl font-bold mb-4 text-lime-400">✓ Invoice Extracted</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-500 text-sm">Invoice Number</p>
                    <p className="text-lg font-semibold text-cyan-300">{extractedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="text-lg text-purple-300">{extractedInvoice.invoiceDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Dealership</p>
                    <p className="text-lg text-cyan-300">{extractedInvoice.dealership}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Parts</p>
                    <div className="space-y-2">
                      {extractedInvoice.items?.map((item, idx) => (
                        <div key={idx} className="bg-purple-500/10 p-3 rounded text-sm border border-purple-500/30">
                          <p className="font-semibold text-cyan-300">{item.partName}</p>
                          <p className="text-purple-400">Qty: {item.quantity} × ${item.unitPrice} = ${item.total}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-purple-500/50 pt-4">
                    <p className="text-gray-500 text-sm">Total</p>
                    <p className="text-2xl font-bold text-lime-400">${extractedInvoice.totalAmount}</p>
                  </div>
                </div>

                <button
                  onClick={saveExtractedInvoice}
                  className="w-full bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 px-6 py-3 rounded-lg font-semibold transition border border-lime-400"
                  style={{boxShadow: '0 0 15px rgba(0, 255, 127, 0.5)'}}
                >
                  Save Invoice
                </button>
              </div>
            )}
          </div>
        )}

        {/* INVOICE HISTORY */}
        {currentScreen === 'invoice-history' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">Invoice History</h2>
            
            {invoices.length === 0 ? (
              <p className="text-purple-400 text-center py-8">No invoices yet. Start by scanning one!</p>
            ) : (
              <div className="space-y-4">
                {invoices.map(inv => (
                  <div key={inv.id} className="bg-black p-6 rounded-lg border-2 border-purple-500/50 hover:border-cyan-400 transition" style={{boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)'}}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-lg font-bold text-cyan-300">{inv.dealership}</p>
                        <p className="text-gray-500">Invoice #{inv.invoiceNumber}</p>
                      </div>
                      <span className="text-2xl font-bold text-lime-400">${inv.totalAmount}</span>
                    </div>
                    <p className="text-sm text-gray-500">{inv.invoiceDate} • Saved {inv.savedDate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RETURNS */}
        {currentScreen === 'returns' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Returns Tracker</h2>
            
            {parts.filter(p => p.status === 'Return').length === 0 ? (
              <p className="text-purple-400 text-center py-8">No returns yet</p>
            ) : (
              <div className="space-y-4">
                {parts.filter(p => p.status === 'Return').map(part => (
                  <div key={part.id} className="bg-black p-6 rounded-lg border-2 border-pink-500/50" style={{boxShadow: '0 0 15px rgba(255, 20, 147, 0.3)'}}>
                    <p className="text-lg font-bold text-cyan-300">{part.part}</p>
                    <p className="text-gray-500 text-sm mb-3">{part.registration} • {part.dealership}</p>
                    <p className="text-sm text-pink-400">Marked for return</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS */}
        {currentScreen === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-lime-500">Reports</h2>
            
            <div className="bg-black p-6 rounded-lg border-2 border-yellow-500/50" style={{boxShadow: '0 0 15px rgba(255, 193, 7, 0.3)'}}>
              <h3 className="text-xl font-bold mb-4 text-yellow-300">Cost by Vehicle</h3>
              <div className="space-y-3">
                {Array.from(new Set(parts.map(p => p.registration))).map(reg => {
                  const vehicleParts = parts.filter(p => p.registration === reg);
                  const cost = vehicleParts.reduce((sum, p) => sum + (p.price || 0), 0);
                  return (
                    <div key={reg} className="flex justify-between items-center bg-gradient-to-r from-yellow-500/10 to-lime-500/10 p-3 rounded border border-yellow-500/30">
                      <span className="font-semibold text-cyan-300">{reg}</span>
                      <div className="text-right">
                        <p className="text-lime-400 font-bold">${cost}</p>
                        <p className="text-gray-500 text-sm">{vehicleParts.length} parts</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {currentScreen === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Settings</h2>

            <div className="bg-black p-6 rounded-lg border-2 border-purple-500/50" style={{boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)'}}>
              <h3 className="text-xl font-bold mb-4 text-cyan-300">Claude API Key</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get your free API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">console.anthropic.com</a>
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 bg-black border-2 border-purple-500/50 rounded-lg text-white mb-4 focus:border-purple-400 focus:outline-none"
                style={{boxShadow: '0 0 10px rgba(147, 51, 234, 0.2)'}}
              />
              <button
                onClick={handleApiKeySave}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 px-6 py-2 rounded-lg font-semibold transition border border-cyan-400"
                style={{boxShadow: '0 0 10px rgba(0, 212, 255, 0.4)'}}
              >
                Save API Key
              </button>
            </div>

            <div className="bg-black p-6 rounded-lg border-2 border-lime-500/50" style={{boxShadow: '0 0 15px rgba(0, 255, 127, 0.3)'}}>
              <h3 className="text-xl font-bold mb-4 text-lime-300">Excel Sync</h3>
              <p className="text-gray-400 mb-4">Auto-sync will save your data to Excel in OneDrive/Google Drive</p>
              <button className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-400 hover:to-lime-500 px-6 py-2 rounded-lg font-semibold transition border border-lime-400" style={{boxShadow: '0 0 10px rgba(0, 255, 127, 0.4)'}}>
                Configure Excel Sync
              </button>
            </div>

            <div className="bg-black p-6 rounded-lg border-2 border-pink-500/50" style={{boxShadow: '0 0 15px rgba(255, 20, 147, 0.3)'}}>
              <h3 className="text-xl font-bold mb-2 text-pink-300">About</h3>
              <p className="text-cyan-300">MB SMASH REPAIR PWA v1.0</p>
              <p className="text-purple-400 text-sm">Parts Management System</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
