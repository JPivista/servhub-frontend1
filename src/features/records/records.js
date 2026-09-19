export const userGroups = {
  admins: ["super_admin", "admin"],
  employees: [
    "admin",
    "purchase",
    "hr",
    "manager",
    "development_tl",
    "design_tl",
    "testing_tl",
    "store_manager",
    "worker",
    "user",
  ],
  managers: ["manager"],
  team_leads: ["development_tl", "design_tl", "testing_tl"],
  workers: ["worker"],
};

export const recordModules = {
  departments: {
    title: "Departments",
    fields: [
      { key: "name", label: "Name" },
      { key: "lead", label: "Lead" },
    ],
  },
  requests: {
    title: "Requests",
    fields: [
      { key: "title", label: "Title" },
      { key: "department", label: "Department" },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"] },
    ],
    workflow: true,
  },
  purchase: {
    title: "Purchase",
    fields: [
      { key: "item", label: "Item" },
      { key: "vendor", label: "Vendor" },
      { key: "amount", label: "Amount" },
    ],
  },
  vendors: {
    title: "Vendors",
    fields: [
      { key: "name", label: "Name" },
      { key: "contact", label: "Contact" },
    ],
  },
  attendance: {
    title: "Attendance",
    fields: [
      { key: "name", label: "Employee" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", type: "select", options: ["Present", "Absent", "Leave"] },
    ],
  },
  leave: {
    title: "Leave",
    fields: [
      { key: "name", label: "Employee" },
      { key: "days", label: "Days" },
      { key: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"] },
    ],
    workflow: true,
  },
  tasks: {
    title: "Tasks",
    fields: [
      { key: "title", label: "Title" },
      { key: "assignee", label: "Assignee" },
      { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Done"] },
    ],
  },
  testing: {
    title: "Testing",
    fields: [
      { key: "title", label: "Case" },
      { key: "status", label: "Status", type: "select", options: ["Queued", "Passed", "Failed"] },
    ],
  },
  inventory: {
    title: "Inventory",
    fields: [
      { key: "item", label: "Item" },
      { key: "quantity", label: "Quantity" },
    ],
  },
  stock: {
    title: "Stock",
    fields: [
      { key: "item", label: "Item" },
      { key: "quantity", label: "Quantity" },
    ],
  },
};

export const defaultCollections = {
  departments: [
    { id: 1, name: "Procurement", lead: "ERP Admin" },
    { id: 2, name: "Development", lead: "Development Team Lead" },
  ],
  requests: [
    { id: 1, title: "Office chairs", department: "Procurement", status: "Pending" },
    { id: 2, title: "Laptop refresh", department: "Development", status: "Approved" },
  ],
  purchase: [
    { id: 1, item: "A4 Paper", vendor: "OfficeMart", amount: "1200" },
  ],
  vendors: [
    { id: 1, name: "OfficeMart", contact: "sales@officemart.com" },
  ],
  attendance: [
    { id: 1, name: "Normal User", date: "2026-09-16", status: "Present" },
  ],
  leave: [
    { id: 1, name: "Normal User", days: "2", status: "Pending" },
  ],
  tasks: [
    { id: 1, title: "Build login flow", assignee: "Development Team Lead", status: "Done" },
  ],
  testing: [
    { id: 1, title: "Login privilege check", status: "Passed" },
  ],
  inventory: [
    { id: 1, item: "HDMI cables", quantity: "40" },
  ],
  stock: [
    { id: 1, item: "A4 Paper", quantity: "12 boxes" },
  ],
};
