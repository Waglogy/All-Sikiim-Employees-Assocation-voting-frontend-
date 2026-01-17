export interface Candidate {
  id: string;
  name: string;
  department: string;
  photoUrl: string;
}

export interface Post {
  id: string;
  title: string;
  candidates: Candidate[];
}

export const VOTING_DATA: Post[] = [
  {
    id: 'president',
    title: 'President',
    candidates: [
      { id: 'p1', name: 'Ramesh Sharma', department: 'Education Dept.', photoUrl: '/placeholder.png' },
      { id: 'p2', name: 'Karma Bhutia', department: 'Roads & Bridges', photoUrl: '/placeholder.png' },
      { id: 'p3', name: 'Sunita Pradhan', department: 'Health Dept.', photoUrl: '/placeholder.png' },
      { id: 'p4', name: 'Dawa Lepcha', department: 'Finance Dept.', photoUrl: '/placeholder.png' },
    ]
  },
  {
    id: 'gen_sec',
    title: 'General Secretary',
    candidates: [
      { id: 'gs1', name: 'Arun Kumar', department: 'Power Dept.', photoUrl: '/placeholder.png' },
      { id: 'gs2', name: 'Pem Dorjee', department: 'Tourism', photoUrl: '/placeholder.png' },
      { id: 'gs3', name: 'Sita Rai', department: 'Social Welfare', photoUrl: '/placeholder.png' },
      { id: 'gs4', name: 'Bikesh Thapa', department: 'Transport', photoUrl: '/placeholder.png' },
    ]
  },
  {
    id: 'vice_pres',
    title: 'Vice President',
    candidates: [
      { id: 'vp1', name: 'Nima Sherpa', department: 'Agriculture', photoUrl: '/placeholder.png' },
      { id: 'vp2', name: 'Gopal Chettri', department: 'Horticulture', photoUrl: '/placeholder.png' },
      { id: 'vp3', name: 'Anita Limbu', department: 'Education Dept.', photoUrl: '/placeholder.png' },
      { id: 'vp4', name: 'Robert Lepcha', department: 'Excise Dept.', photoUrl: '/placeholder.png' },
    ]
  },
  {
    id: 'treasurer',
    title: 'Treasurer',
    candidates: [
      { id: 't1', name: 'Mina Subba', department: 'Finance Dept.', photoUrl: '/placeholder.png' },
      { id: 't2', name: 'Rajesh Gupta', department: 'Planning', photoUrl: '/placeholder.png' },
      { id: 't3', name: 'Sonam Tashi', department: 'Rural Dev.', photoUrl: '/placeholder.png' },
      { id: 't4', name: 'Pema Wangchuk', department: 'Urban Dev.', photoUrl: '/placeholder.png' },
    ]
  }
];
