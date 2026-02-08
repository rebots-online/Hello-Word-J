// Copyright (C) 2025 Robin L. M. Cheung, MBA. All rights reserved.
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
    sanctissimissa::run();
}