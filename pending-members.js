import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   ELEMENT
===================================================== */

const memberList =
    document.getElementById("memberList");


/* =====================================================
   LOAD PENDING MEMBERS
===================================================== */

async function loadPendingMembers(){

    memberList.innerHTML = `
        <div class="loading">
            ⏳ Members Loading...
        </div>
    `;


    try{

        const snapshot =
            await getDocs(
                collection(db,"members")
            );


        memberList.innerHTML = "";

        let pendingFound = false;


        snapshot.forEach(docSnap => {

            const member = {

                id: docSnap.id,

                ...docSnap.data()

            };


            /* =================================================
               APPROVAL CHECK

               approved:true
               OR
               old data status:"approved"

               = APPROVED

               Otherwise = PENDING
            ================================================= */

            const isApproved =
                member.approved === true ||
                member.status === "approved";


            if(isApproved){

                return;

            }


            pendingFound = true;


            const photo =
                member.photoUrl ||
                "images/default-user.png";


            memberList.innerHTML += `

                <div class="member-card">

                    <img
                        src="${escapeHTML(photo)}"
                        onerror="
                            this.onerror=null;
                            this.src='images/default-user.png';
                        "
                        alt="Member Photo"
                    >


                    <h3>

                        ${escapeHTML(
                            member.name ||
                            "Member"
                        )}

                    </h3>


                    <p>

                        <b>Mobile:</b>

                        ${escapeHTML(
                            member.mobile ||
                            "-"
                        )}

                    </p>


                    <p>

                        <b>Address:</b>

                        ${escapeHTML(
                            member.address ||
                            "-"
                        )}

                    </p>


                    <p>

                        <b>Payment:</b>

                        <span class="payment-status">

                            ${
                                member.paid === true
                                ? "✅ Paid"
                                : "⏳ Pending"
                            }

                        </span>

                    </p>


                    <p>

                        <b>Approval:</b>

                        <span class="approval-status">

                            ⏳ Pending

                        </span>

                    </p>


                    <div class="actions">


                        <button
                            class="approve"
                            onclick="
                                approveMember(
                                    '${member.id}'
                                )
                            "
                        >

                            ✅ Approve

                        </button>


                        <button
                            class="reject"
                            onclick="
                                rejectMember(
                                    '${member.id}'
                                )
                            "
                        >

                            ❌ Reject

                        </button>


                    </div>

                </div>

            `;

        });


        /* =================================================
           NO PENDING MEMBER
        ================================================= */

        if(!pendingFound){

            memberList.innerHTML = `

                <div class="empty">

                    🎉 ବର୍ତ୍ତମାନ କୌଣସି Pending
                    Member ନାହାନ୍ତି।

                </div>

            `;

        }

    }

    catch(error){

        console.error(
            "Pending Members Error:",
            error
        );


        memberList.innerHTML = `

            <div class="error">

                ❌ Member load ହୋଇପାରିଲା ନାହିଁ।

                <br><br>

                ${escapeHTML(error.message)}

            </div>

        `;

    }

}


/* =====================================================
   GET NEXT MEMBER ID
===================================================== */

async function getNextMemberId(){

    const counterRef =
        doc(
            db,
            "system",
            "counter"
        );


    const counterSnap =
        await getDoc(counterRef);


    let number = 1;


    if(counterSnap.exists()){

        number =
            Number(
                counterSnap.data().lastNumber || 0
            ) + 1;

    }


    await setDoc(
        counterRef,
        {
            lastNumber: number
        }
    );


    return (
        "ORKS" +
        String(number).padStart(4,"0")
    );

}


/* =====================================================
   APPROVE MEMBER
===================================================== */

window.approveMember =
async function(id){

    try{

        /* =================================================
           GET MEMBER
        ================================================= */

        const memberRef =
            doc(
                db,
                "members",
                id
            );


        const memberSnap =
            await getDoc(memberRef);


        if(!memberSnap.exists()){

            alert(
                "❌ Member ମିଳିଲା ନାହିଁ।"
            );

            return;

        }


        const member =
            memberSnap.data();


        /* =================================================
           DOUBLE APPROVAL PROTECTION
        ================================================= */

        const alreadyApproved =
            member.approved === true ||
            member.status === "approved";


        if(alreadyApproved){

            alert(
                "ℹ️ ଏହି Member ପୂର୍ବରୁ Approved ହୋଇଛନ୍ତି।"
            );

            loadPendingMembers();

            return;

        }


        /* =================================================
           MEMBER NAME
        ================================================= */

        const memberName =
            member.name || "Member";


        /* =================================================
           MOBILE
        ================================================= */

        const mobile =
            String(
                member.mobile || ""
            ).replace(
                /\D/g,
                ""
            );


        if(!mobile){

            alert(
                "⚠️ ଏହି Member ଙ୍କ Mobile Number ମିଳିଲା ନାହିଁ।"
            );

            return;

        }


        /* =================================================
           CONFIRM APPROVAL
        ================================================= */

        const confirmApprove =
            confirm(
                "✅ ଏହି Member କୁ Approve କରିବେ?\n\n" +
                "Member: " +
                memberName
            );


        if(!confirmApprove){

            return;

        }


        /* =================================================
           MEMBER ID
        ================================================= */

        const memberId =
            await getNextMemberId();


        /* =================================================
           RECEIPT ID
        ================================================= */

        const txnId =
            "RCPT-" +
            Date.now();


        /* =================================================
           UPDATE ONLY THIS MEMBER

           OLD DATA SAFE

           Existing fields are NOT deleted.
        ================================================= */

        await updateDoc(
            memberRef,
            {

                memberId:
                    memberId,

                approved:
                    true,

                status:
                    "approved",

                paid:
                    true,

                txnId:
                    txnId

            }
        );


        /* =================================================
           INCOME ENTRY
        ================================================= */

        await addDoc(
            collection(
                db,
                "income"
            ),
            {

                memberId:
                    memberId,

                name:
                    memberName,

                mobile:
                    member.mobile || "",

                amount:
                    1200,

                purpose:
                    "New Membership Fee",

                paymentMode:
                    "Online",

                receiptNo:
                    txnId,

                collectedBy:
                    "Admin",

                createdAt:
                    new Date()

            }
        );


        /* =================================================
           SUCCESS
        ================================================= */

        alert(
            "✅ Member Approved Successfully\n\n" +
            "Member ID: " +
            memberId
        );


        /* =================================================
           WHATSAPP MESSAGE
        ================================================= */

        const message = `ନମସ୍କାର 🙏

🌺 ଜୟ ଜଗନ୍ନାଥ 🚩

ପ୍ରିୟ ${memberName},

ଆପଣଙ୍କ ସଦସ୍ୟ ପଞ୍ଜୀକରଣ ସଫଳତାର ସହିତ ଅନୁମୋଦିତ ହୋଇଛି।

ଆପଣ ବର୍ତ୍ତମାନ “ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ, ସୁରତ”ର ଜଣେ ସ୍ୱୀକୃତ ସଦସ୍ୟ।

ଆପଣଙ୍କ ସଦସ୍ୟ ID: ${memberId}

ସଂଘ ପକ୍ଷରୁ ଆପଣଙ୍କୁ ହାର୍ଦ୍ଦିକ ସ୍ୱାଗତ। 🙏🌹

ଆମର ଲକ୍ଷ୍ୟ — ଏକତା, ସେବା ଓ ଓଡ଼ିଆ ସଂସ୍କୃତିର ସୁରକ୍ଷା। 🤝

ଆପଣଙ୍କ ସହଯୋଗ ଆମ ସଂଘକୁ ଆହୁରି ମଜବୁତ କରିବ।

ଜୟ ଜଗନ୍ନାଥ 🚩🙏

ଧନ୍ୟବାଦ।
ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ, ସୁରତ`;


        /* =================================================
           WHATSAPP NUMBER
        ================================================= */

        let whatsappNumber =
            mobile;


        if(
            whatsappNumber.length === 10
        ){

            whatsappNumber =
                "91" +
                whatsappNumber;

        }


        /* =================================================
           WHATSAPP URL
        ================================================= */

        const whatsappURL =
            "https://wa.me/" +
            whatsappNumber +
            "?text=" +
            encodeURIComponent(
                message
            );


        /* =================================================
           WHATSAPP CONFIRM
        ================================================= */

        const openWhatsApp =
            confirm(
                "📱 WhatsApp Message ପଠାଇବେ?\n\n" +
                "Member: " +
                memberName
            );


        if(openWhatsApp){

            window.location.href =
                whatsappURL;

        }


        /* =================================================
           RELOAD PENDING LIST
        ================================================= */

        loadPendingMembers();

    }

    catch(error){

        console.error(
            "Approve Error:",
            error
        );


        alert(
            "❌ Approval failed:\n" +
            error.message
        );

    }

};


/* =====================================================
   REJECT MEMBER
===================================================== */

window.rejectMember =
async function(id){

    try{

        const ok =
            confirm(
                "⚠️ ଏହି Pending Member କୁ Delete କରିବେ?\n\n" +
                "ଏହା କେବଳ ଏହି Member record କୁ delete କରିବ।"
            );


        if(!ok){

            return;

        }


        await deleteDoc(
            doc(
                db,
                "members",
                id
            )
        );


        alert(
            "❌ Member Rejected Successfully"
        );


        loadPendingMembers();

    }

    catch(error){

        console.error(
            "Reject Error:",
            error
        );


        alert(
            "❌ Reject failed:\n" +
            error.message
        );

    }

};


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   START
===================================================== */

loadPendingMembers();


console.log(
    "✅ Pending Members System Loaded"
);
