export interface Sucursal {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
}

export const sucursales: Sucursal[] = [
  {
    id: "sede-central",
    name: "Lo de Juan — Sede Central",
    address: "Av. Los Olivos 123, Los Olivos, Lima",
    phone: "+51 999 111 222",
    hours: "Lun-Dom 11:00 - 22:00",
    lat: -11.963,
    lng: -77.052,
  },
  {
    id: "sede-san-miguel",
    name: "Lo de Juan — San Miguel",
    address: "Av. La Marina 456, San Miguel, Lima",
    phone: "+51 999 333 444",
    hours: "Lun-Dom 11:00 - 22:00",
    lat: -12.077,
    lng: -77.089,
  },
  {
    id: "sede-surco",
    name: "Lo de Juan — Surco",
    address: "Av. Benavides 789, Surco, Lima",
    phone: "+51 999 555 666",
    hours: "Lun-Dom 11:00 - 22:00",
    lat: -12.136,
    lng: -76.993,
  },
];
