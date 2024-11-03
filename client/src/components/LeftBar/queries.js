import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default async function getEquipmentByUserUID(userUID) {
  try {
    const equipmentRef = collection(db, "Equipment");

    //query for equipment for current user
    const q = query(equipmentRef, where("UserUID", "==", userUID.uid));

    // query db
    const querySnapshot = await getDocs(q);

    // Map through the results and return all document data
    const equipmentList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("Equipment List:", equipmentList);
    return equipmentList; 
  } catch (error) {
    console.error("Error retrieving equipment by UserUID:", error);
    return [];
  }
}
