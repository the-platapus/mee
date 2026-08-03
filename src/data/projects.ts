export interface Project {
  id: string;
  section: "Hackintoshes" | "IoT Projects";
  title: string;
  subtitle: string;
  status: string;
  statusBg: string;
  statusBorder: string;
  statusText: string;
  description: string;
  techStack: string[];
  images: string[];
}

export const showcaseProjects: Project[] = [
  {
    id: "asus-p5440",
    section: "Hackintoshes",
    title: "ASUS ExpertBook P5440",
    subtitle: "Custom macOS OpenCore Architecture",
    status: "Fully Operational 🍏",
    statusBg: "rgba(16, 185, 129, 0.15)",
    statusBorder: "rgba(16, 185, 129, 0.4)",
    statusText: "#34d399",
    description:
      "A tailored vanilla macOS build engineered specifically for the ASUS ExpertBook P5440 Ultrabook. Features seamless native hardware integration including complete ACPI power management, GPU metal acceleration, multi-touch gesture trackpad, native audio codecs, and full sleep/wake states through advanced OpenCore bootloader configuration and SSDT hotpatching.",
    techStack: ["OpenCore", "macOS Sonoma", "ACPI / ASL", "Kext Patching", "EFI Optimization"],
    images: [
      "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/showcase/hackintoshes/asus-expertbook-p5440/unnamed%20(1).png",
      "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/showcase/hackintoshes/asus-expertbook-p5440/unnamed.gif",
      "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/showcase/hackintoshes/asus-expertbook-p5440/unnamed.png"
    ],
  },
  {
    id: "iot-engine-mgmt",
    section: "IoT Projects",
    title: "Engine Management System",
    subtitle: "Real-Time Embedded Telemetry & ECU Tuning",
    status: "Active Development ⚙️",
    statusBg: "rgba(59, 130, 246, 0.15)",
    statusBorder: "rgba(59, 130, 246, 0.4)",
    statusText: "#60a5fa",
    description:
      "A precision standalone embedded IoT Engine Management System (EMS) crafted for real-time diagnostics, high-frequency CAN bus telemetry monitoring, and dynamic engine performance parameter control. Engineered to interface directly with engine instrumentation for sub-millisecond data logging and live diagnostics.",
    techStack: ["ESP32 / ARM", "CAN Bus Protocol", "C++ / Firmware", "Embedded Telemetry", "PCB Design"],
    images: [
      "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/showcase/iot_projects/em/Screenshot%20From%202026-07-29%2016-49-46.png"
    ],
  },
  {
    id: "iot-ffb-wheel",
    section: "IoT Projects",
    title: "Force-Feedback Steering Wheel",
    subtitle: "High-Fidelity Sim-Racing Physics Hardware",
    status: "Prototype Operational 🏎️",
    statusBg: "rgba(245, 158, 11, 0.15)",
    statusBorder: "rgba(245, 158, 11, 0.4)",
    statusText: "#fbbf24",
    description:
      "An advanced custom-engineered force-feedback simulation steering wheel system designed for competitive sim-racing. Harnesses closed-loop BLDC motor control, ultra-high resolution magnetic rotary encoders, and a custom haptic physics communication pipeline to translate vehicle telemetry into realistic physical resistance and road vibrations.",
    techStack: ["BLDC Motor Control", "Haptic Physics", "Microcontroller Firmware", "USB HID Protocol", "3D Modeling"],
    images: [
      "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/showcase/iot_projects/ffb-sw/Screenshot%20From%202026-07-29%2016-50-07.png",
      "https://raw.githubusercontent.com/the-platapus/mee/refs/heads/main/public/assets/showcase/iot_projects/ffb-sw/Screenshot%20From%202026-07-29%2016-50-36.png"
    ],
  }
];
