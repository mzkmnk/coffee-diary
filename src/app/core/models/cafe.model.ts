export interface Cafe {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitDate: Date;
  rating: number;
  memo: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}