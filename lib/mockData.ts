
export interface Candidate {
  id: string;
  name: string;
  department?: string;
}

export interface Post {
  id: number;
  title: string;
  candidates: Candidate[];
}

export const POSTS: Post[] = [
  {
    id: 1,
    title: "President",
    candidates: [
      { id: "p1_c1", name: "Rajesh Kumar Sharma", department: "Roads & Bridges" },
      { id: "p1_c2", name: "Sonam Dorjee Bhutia", department: "Education" },
      { id: "p1_c3", name: "Karma Loday", department: "Health" },
      { id: "p1_c4", name: "Bishnu Prasad Pradhan", department: "Forest" },
    ],
  },
  {
    id: 2,
    title: "General Secretary",
    candidates: [
      { id: "p2_c1", name: "Pema Choden", department: "Social Welfare" },
      { id: "p2_c2", name: "Suresh Rai", department: "Power" },
      { id: "p2_c3", name: "Mingma Sherpa", department: "Tourism" },
      { id: "p2_c4", name: "Anita Devi", department: "Agriculture" },
    ],
  },
  {
    id: 3,
    title: "Treasurer",
    candidates: [
      { id: "p3_c1", name: "Rakesh Gurung", department: "Finance" },
      { id: "p3_c2", name: "Diki Lepcha", department: "Rural Development" },
      { id: "p3_c3", name: "Sanjay Subba", department: "Transport" },
      { id: "p3_c4", name: "Meena Chettri", department: "Excise" },
    ],
  },
  {
    id: 4,
    title: "Vice President",
    candidates: [
      { id: "p4_c1", name: "Tashi Tenzing", department: "Sports" },
      { id: "p4_c2", name: "Sunita Tamang", department: "Culture" },
      { id: "p4_c3", name: "Arjun Singh", department: "Irrigation" },
      { id: "p4_c4", name: "Lakpa Doma", department: "Horticulture" },
    ],
  },
];

export const VALID_USERS = [
  { username: "admin", code: "sikkim2025" },
  { username: "voter1", code: "emp001" },
];
