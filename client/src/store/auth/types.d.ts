export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}
