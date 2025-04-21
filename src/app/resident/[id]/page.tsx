import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Resident } from '@/types/resident';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface Props {
  params: {
    id: string;
  };
}

export default async function ResidentPage({ params }: Props) {
  const docRef = doc(db, 'resident', params.id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return notFound();
  }

  const resident = snapshot.data() as Resident;

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded mt-10 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Resident Details</h1>

      {/* Profile Picture */}
      {resident.profilePicture && (
        <div className="mb-4">
          <Image
            src={resident.profilePicture}
            alt="Profile Picture"
            width={150}
            height={150}
            className="rounded-full object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div><strong>Full Name:</strong> {resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}</div>
        <div><strong>Birthdate:</strong> {resident.birthdate}</div>
        <div><strong>Age:</strong> {resident.age}</div>
        <div><strong>Gender:</strong> {resident.gender}</div>
        <div><strong>Civil Status:</strong> {resident.civilStatus}</div>
        <div><strong>Address:</strong> {resident.address}</div>
        <div><strong>Phone:</strong> {resident.phone}</div>
        <div><strong>Email:</strong> {resident.email}</div>
        <div><strong>Created At:</strong> {resident.createdAt.toDate().toLocaleString()}</div>
        <div><strong>Last Updated:</strong> {resident.updatedAt.toDate().toLocaleString()}</div>
      </div>
    </main>
  );
}
