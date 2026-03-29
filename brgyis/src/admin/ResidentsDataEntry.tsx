import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addResident, getResidents } from "@/db/queries";
import { persistDatabase } from "@/db/init";
import { Resident } from "@/types/database";

const AdminResidentsPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    civilStatus: "",
    isPWD: "no",
    status: "active" as "active" | "inactive" | "moved",
  });
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pwdFilter, setPwdFilter] = useState<"all" | "pwd" | "non-pwd">("all");

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const data = await getResidents();
      setResidents(data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const newResident = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName || undefined,
        dateOfBirth: form.dateOfBirth,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address,
        gender: form.gender as 'male' | 'female' | 'other' || undefined,
        civilStatus: form.civilStatus as 'single' | 'married' | 'widowed' | 'divorced' | 'separated' || undefined,
        isPWD: form.isPWD === "yes",
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      };
      await addResident(newResident);
      await persistDatabase();
      setForm({
        firstName: "",
        lastName: "",
        middleName: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
        civilStatus: "",
        isPWD: "no",
        status: "active",
      });
      fetchResidents();
    } finally {
      setLoading(false);
    }
  };

  // Fetch residents on mount
  useEffect(() => { fetchResidents(); }, []);

  const filteredResidents = residents.filter((resident) => {
    const search = searchQuery.trim().toLowerCase();
    const isPwdResident = !!resident.isPWD;

    const matchesSearch =
      search.length === 0 ||
      `${resident.firstName} ${resident.lastName} ${resident.middleName || ""}`
        .toLowerCase()
        .includes(search) ||
      (resident.address || "").toLowerCase().includes(search) ||
      (resident.email || "").toLowerCase().includes(search) ||
      (resident.phone || "").toLowerCase().includes(search) ||
      (search === "pwd" && isPwdResident) ||
      (search === "non-pwd" && !isPwdResident);

    const matchesPwdFilter =
      pwdFilter === "all" ||
      (pwdFilter === "pwd" && isPwdResident) ||
      (pwdFilter === "non-pwd" && !isPwdResident);

    return matchesSearch && matchesPwdFilter;
  });

  const maleResidentsCount = residents.filter(
    (resident) => resident.gender?.toLowerCase() === "male"
  ).length;

  const femaleResidentsCount = residents.filter(
    (resident) => resident.gender?.toLowerCase() === "female"
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Residents Data Entry</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Male Residents</p>
          <p className="text-2xl font-bold">{maleResidentsCount}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Female Residents</p>
          <p className="text-2xl font-bold">{femaleResidentsCount}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <Label>First Name</Label>
          <Input name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
        <div>
          <Label>Middle Name</Label>
          <Input name="middleName" value={form.middleName} onChange={handleChange} />
        </div>
        <div>
          <Label>Date of Birth</Label>
          <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="col-span-2">
          <Label>Address</Label>
          <Input name="address" value={form.address} onChange={handleChange} required />
        </div>
        <div>
          <Label>Gender</Label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <Label>Civil Status</Label>
          <select name="civilStatus" value={form.civilStatus} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="">Select Civil Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
            <option value="separated">Separated</option>
          </select>
        </div>
        <div>
          <Label>PWD Status</Label>
          <select name="isPWD" value={form.isPWD} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div>
          <Label>Status</Label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="moved">Moved</option>
          </select>
        </div>
        <div className="col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Add Resident"}</Button>
        </div>
      </form>
      <h2 className="text-xl font-semibold mb-2">Residents List</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <Input
          placeholder="Search name, address, email, phone or type PWD"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={pwdFilter}
          onChange={(e) => setPwdFilter(e.target.value as "all" | "pwd" | "non-pwd")}
          className="w-full border rounded px-2 py-2"
        >
          <option value="all">All Residents</option>
          <option value="pwd">PWD Only</option>
          <option value="non-pwd">Non-PWD Only</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">DOB</th>
              <th className="border px-2 py-1">Gender</th>
              <th className="border px-2 py-1">PWD</th>
              <th className="border px-2 py-1">Civil Status</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Phone</th>
              <th className="border px-2 py-1">Address</th>
              <th className="border px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.map((r) => (
              <tr key={r.id}>
                <td className="border px-2 py-1">{r.lastName}, {r.firstName} {r.middleName}</td>
                <td className="border px-2 py-1">{r.dateOfBirth}</td>
                <td className="border px-2 py-1">{r.gender || '-'}</td>
                <td className="border px-2 py-1">{r.isPWD ? 'Yes' : 'No'}</td>
                <td className="border px-2 py-1">{r.civilStatus || '-'}</td>
                <td className="border px-2 py-1">{r.email}</td>
                <td className="border px-2 py-1">{r.phone}</td>
                <td className="border px-2 py-1">{r.address}</td>
                <td className="border px-2 py-1">{r.status}</td>
              </tr>
            ))}
            {!loading && filteredResidents.length === 0 && (
              <tr>
                <td className="border px-2 py-3 text-center" colSpan={9}>
                  No residents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminResidentsPage;
