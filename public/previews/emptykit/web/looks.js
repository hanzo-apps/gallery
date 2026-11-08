// Emptykit looks, accent presets and the catalogue (generated from the kit's style table).
export const LOOKS = {
 "mono-light": {
  "name": "Mono + one accent",
  "bg": "#FFFFFF",
  "dark": false,
  "fill": {
   "mode": "tone",
   "shade": "#5C6375",
   "k": {
    "+z": 0.0,
    "-y": 0.1,
    "+x": 0.22,
    "-z": 0.3,
    "+y": 0.1,
    "-x": 0.22
   },
   "roles": {
    "body": "#F3F4F7",
    "paper": "#FFFFFF",
    "soft": "#E9EBF0",
    "accent": "#5B5CF6",
    "dark": "#C4C8D2",
    "glass": "#F3F4F7"
   },
   "accent_shade": "#2B2C9A"
  },
  "lines": {
   "color": {
    "ink": "#23262E",
    "accent": "#23262E"
   },
   "width": {
    "outline": 3.6,
    "contour": 3.0,
    "crease": 2.6,
    "detail": 2.6
   }
  },
  "shadow": {
   "color": "#23262E",
   "opacity": 0.16,
   "blur": 4,
   "on_objects": true
  }
 },
 "mono-dark": {
  "name": "Mono + one accent",
  "bg": "#0F1115",
  "dark": true,
  "fill": {
   "mode": "tone",
   "shade": "#0B0C10",
   "k": {
    "+z": 0.0,
    "-y": 0.22,
    "+x": 0.42,
    "-z": 0.6,
    "+y": 0.22,
    "-x": 0.42
   },
   "roles": {
    "body": "#2A2F3B",
    "paper": "#323845",
    "soft": "#232731",
    "accent": "#6D6BFF",
    "dark": "#1A1D25",
    "glass": "#2A2F3B"
   },
   "accent_shade": "#2F2DB0"
  },
  "lines": {
   "color": {
    "ink": "#D6DBE5",
    "accent": "#D6DBE5"
   },
   "width": {
    "outline": 3.6,
    "contour": 3.0,
    "crease": 2.6,
    "detail": 2.6
   }
  },
  "shadow": {
   "color": "#000000",
   "opacity": 0.45,
   "blur": 4,
   "on_objects": true
  }
 },
 "mono-dark-glow": {
  "name": "Mono + one accent",
  "bg": "#0F1115",
  "dark": true,
  "fill": {
   "mode": "tone",
   "shade": "#0B0C10",
   "k": {
    "+z": 0.0,
    "-y": 0.22,
    "+x": 0.42,
    "-z": 0.6,
    "+y": 0.22,
    "-x": 0.42
   },
   "roles": {
    "body": "#2A2F3B",
    "paper": "#323845",
    "soft": "#232731",
    "accent": "#6D6BFF",
    "dark": "#1A1D25",
    "glass": "#2A2F3B"
   },
   "accent_shade": "#2F2DB0"
  },
  "lines": {
   "color": {
    "ink": "#D6DBE5",
    "accent": "#D6DBE5"
   },
   "width": {
    "outline": 3.6,
    "contour": 3.0,
    "crease": 2.6,
    "detail": 2.6
   }
  },
  "shadow": {
   "color": "#000000",
   "opacity": 0.45,
   "blur": 4,
   "on_objects": true
  },
  "glow": {
   "color": "#7B79FF",
   "opacity": 0.8,
   "blur": 9
  }
 },
 "line-light": {
  "name": "Technical line",
  "bg": "#FFFFFF",
  "dark": false,
  "fill": null,
  "lines": {
   "color": {
    "ink": "#1F2430",
    "accent": "#1F2430"
   },
   "width": {
    "outline": 3.6,
    "contour": 3.0,
    "crease": 2.6,
    "detail": 2.6
   },
   "hidden": {
    "width": 1.6,
    "dash": [
     6,
     7
    ],
    "opacity": 0.3
   }
  }
 },
 "line-dark": {
  "name": "Technical line",
  "bg": "#0F1115",
  "dark": true,
  "fill": null,
  "lines": {
   "color": {
    "ink": "#D6DBE5",
    "accent": "#D6DBE5"
   },
   "width": {
    "outline": 3.6,
    "contour": 3.0,
    "crease": 2.6,
    "detail": 2.6
   },
   "hidden": {
    "width": 1.6,
    "dash": [
     6,
     7
    ],
    "opacity": 0.28
   }
  }
 },
 "blueprint-light": {
  "name": "Blueprint",
  "bg": "#F3F7FD",
  "dark": false,
  "fill": {
   "mode": "tone",
   "shade": "#C9D7EE",
   "k": {
    "+z": 0.0,
    "-y": 0.3,
    "+x": 0.55,
    "-z": 0.8,
    "+y": 0.3,
    "-x": 0.55
   },
   "roles": {
    "body": "#F3F7FD",
    "paper": "#F7FAFE",
    "soft": "#EEF3FB",
    "accent": "#E6EEFB",
    "dark": "#E3EBF8",
    "glass": "#F3F7FD"
   },
   "opacity": 0.85
  },
  "lines": {
   "color": {
    "ink": "#1C4B97",
    "accent": "#1C4B97"
   },
   "width": {
    "outline": 3.0,
    "contour": 2.6,
    "crease": 2.2,
    "detail": 2.0
   },
   "hidden": {
    "width": 1.5,
    "dash": [
     5,
     6
    ],
    "opacity": 0.32,
    "over_fill": true
   }
  },
  "grid": {
   "color": "#1C4B97",
   "opacity": 0.07,
   "step": 0.5,
   "extent": 9
  },
  "guides": {
   "color": "#1C4B97",
   "opacity": 0.55,
   "width": 1.3,
   "font_size": 13
  }
 },
 "blueprint-dark": {
  "name": "Blueprint",
  "bg": "#0E3A78",
  "dark": true,
  "fill": {
   "mode": "tone",
   "shade": "#0A2A5C",
   "k": {
    "+z": 0.0,
    "-y": 0.3,
    "+x": 0.55,
    "-z": 0.8,
    "+y": 0.3,
    "-x": 0.55
   },
   "roles": {
    "body": "#164A92",
    "paper": "#174D96",
    "soft": "#14448A",
    "accent": "#1B57A8",
    "dark": "#113D7E",
    "glass": "#164A92"
   },
   "opacity": 0.55
  },
  "lines": {
   "color": {
    "ink": "#EEF5FF",
    "accent": "#EEF5FF"
   },
   "width": {
    "outline": 3.0,
    "contour": 2.6,
    "crease": 2.2,
    "detail": 2.0
   },
   "hidden": {
    "width": 1.5,
    "dash": [
     5,
     6
    ],
    "opacity": 0.38,
    "over_fill": true
   }
  },
  "grid": {
   "color": "#FFFFFF",
   "opacity": 0.09,
   "step": 0.5,
   "extent": 9
  },
  "guides": {
   "color": "#CFE0FF",
   "opacity": 0.6,
   "width": 1.3,
   "font_size": 13
  }
 }
};
export const ACCENTS = {
 "indigo": {
  "light": [
   "#5B5CF6",
   "#2B2C9A"
  ],
  "dark": [
   "#6D6BFF",
   "#2F2DB0"
  ],
  "glow": "#7B79FF"
 },
 "violet": {
  "light": [
   "#8B5CF6",
   "#4F2998"
  ],
  "dark": [
   "#976EFF",
   "#5829AB"
  ],
  "glow": "#9F7EFF"
 },
 "blue": {
  "light": [
   "#2F7CF6",
   "#064298"
  ],
  "dark": [
   "#438BFF",
   "#0047AA"
  ],
  "glow": "#5898FF"
 },
 "teal": {
  "light": [
   "#0FA3A3",
   "#005C5C"
  ],
  "dark": [
   "#37B0B0",
   "#006464"
  ],
  "glow": "#54B9B9"
 },
 "orange": {
  "light": [
   "#F2702A",
   "#8F3800"
  ],
  "dark": [
   "#FE8143",
   "#9B3E00"
  ],
  "glow": "#FF9462"
 },
 "pink": {
  "light": [
   "#E8488A",
   "#8C164C"
  ],
  "dark": [
   "#F45C97",
   "#9C0853"
  ],
  "glow": "#F96FA2"
 }
};
export const SUBJECTS = [[1, "no-messages", "Communication", "No messages yet"], [2, "inbox-zero", "Communication", "Inbox zero"], [3, "no-comments", "Communication", "No comments yet"], [4, "no-notifications", "Communication", "You're all caught up"], [5, "no-contacts", "Communication", "No contacts"], [6, "no-mentions", "Communication", "No mentions"], [7, "no-files", "Files and media", "No files yet"], [8, "no-documents", "Files and media", "No documents"], [9, "no-images", "Files and media", "No photos yet"], [10, "upload", "Files and media", "Drop files to upload"], [11, "trash-empty", "Files and media", "Trash is empty"], [12, "archive-empty", "Files and media", "Nothing archived"], [13, "no-results", "Search and data", "No results found"], [14, "no-filter-results", "Search and data", "No matches for these filters"], [15, "no-data", "Search and data", "No data yet"], [16, "empty-dashboard", "Search and data", "Your dashboard is empty"], [17, "no-history", "Search and data", "No activity yet"], [18, "no-tags", "Search and data", "No tags"], [19, "empty-cart", "Commerce", "Your cart is empty"], [20, "no-orders", "Commerce", "No orders yet"], [21, "no-payment-methods", "Commerce", "No payment methods"], [22, "wallet-empty", "Commerce", "No transactions"], [23, "no-invoices", "Commerce", "No invoices"], [24, "no-products", "Commerce", "No products"], [25, "no-team-members", "Users, teams and keys", "Invite your team"], [26, "invite-sent", "Users, teams and keys", "Invitation sent"], [27, "no-connections", "Users, teams and keys", "No connections"], [28, "profile-incomplete", "Users, teams and keys", "Complete your profile"], [29, "no-reviews", "Users, teams and keys", "No reviews yet"], [30, "no-api-keys", "Users, teams and keys", "No API keys"], [31, "all-done", "Tasks and time", "All done"], [32, "no-events", "Tasks and time", "Nothing scheduled"], [33, "no-reminders", "Tasks and time", "No reminders"], [34, "no-projects", "Tasks and time", "No projects yet"], [35, "no-notes", "Tasks and time", "No notes"], [36, "no-scheduled-jobs", "Tasks and time", "No jobs running"], [37, "offline", "Connectivity, errors and access", "You're offline"], [38, "page-not-found", "Connectivity, errors and access", "Page not found"], [39, "server-error", "Connectivity, errors and access", "Something went wrong"], [40, "no-permission", "Connectivity, errors and access", "You don't have access"], [41, "maintenance", "Connectivity, errors and access", "Down for maintenance"], [42, "failed-to-load", "Connectivity, errors and access", "Couldn't load this"], [43, "welcome", "Onboarding, setup and success", "Welcome, let's get started"], [44, "setup-required", "Onboarding, setup and success", "Finish setting up"], [45, "no-integrations", "Onboarding, setup and success", "No apps connected"], [46, "empty-ai-chat", "Onboarding, setup and success", "Ask anything"], [47, "upgrade", "Onboarding, setup and success", "Upgrade to unlock"], [48, "success", "Onboarding, setup and success", "You're all set"]];
export const BOLD = 1.45;
