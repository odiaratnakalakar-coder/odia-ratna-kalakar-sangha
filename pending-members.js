import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  
  


const memberList = document.getElementById("memberList");

async function loadPendingMembers() {

  memberList.innerHTML = "<h3>Loading...</h3>";

  const snapshot = await getDocs(collection(db, "members"));

  memberList.innerHTML = "";

  snapshot.forEach((docSnap) => {

    const member = {
      id: docSnap.id,
      ...docSnap.data()
    };

    if (member.paid === true) return;
        memberList.innerHTML += `
      <div class="member-card">

        <img src="${member.photoUrl || 'images/default-user.png'}">

        <h3>${member.name}</h3>

        <p><b>Mobile:</b> ${member.mobile}</p>

        <p><b>Address:</b> ${member.address}</p>

        <p><b>Payment:</b> Pending</p>

        <div class="actions">

          <button
            class="approve"
            onclick="approveMember('${member.id}')">
            ✅ Approve
          </button>

          <button
            class="reject"
            onclick="rejectMember('${member.id}')">
            ❌ Reject
          </button>

        </div>

      </div>
    `;
      });

}

loadPendingMembers();
async function getNextMemberId() {

  const counterRef = doc(db, "system", "counter");
  const counterSnap = await getDoc(counterRef);

  let number = 1;

  if (counterSnap.exists()) {
    number = counterSnap.data().lastNumber + 1;
  }

  await setDoc(counterRef, {
    lastNumber: number
  });

  return "ORKS" + String(number).padStart(4, "0");

}
window.approveMember = async function(id){

  const memberRef = doc(db, "members", id);

const memberSnap = await getDoc(memberRef);

if (!memberSnap.exists()) {
  alert("Member ମିଳିଲା ନାହିଁ");
  return;
}

const memberId = await getNextMemberId();

await updateDoc(memberRef, {
  memberId: memberId,
  status: "approved",
  paid: true
});

alert("✅ Member Approved Successfully");

loadPendingMembers();

};

window.rejectMember = async function(id){

  if (!confirm("ଏହି Pending Member କୁ Reject କରିବେ?")) return;

  await deleteDoc(doc(db, "members", id));

  alert("❌ Member Rejected Successfully");

  loadPendingMembers();

};

  


  



   

