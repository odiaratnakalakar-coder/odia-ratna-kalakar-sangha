import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =====================================================
   ELEMENT
===================================================== */

const memberList =
    document.getElementById("memberList");


/* =====================================================
   APPROVAL CHECK
===================================================== */

function isApproved(member){

    const approval =
        String(member.approval ?? "")
        .trim()
        .toLowerCase();

    const status =
        String(member.status ?? "")
        .trim()
        .toLowerCase();

    return (
        member.approved === true ||
        approval === "approved" ||
        status === "approved"
    );

}


/* =====================================================
   LOAD PENDING MEMBERS
===================================================== */

async function loadPendingMembers(){

    memberList.innerHTML = `
        <div class="loading">
            ⏳ Pending Members Loading...
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


            /* =========================================
               APPROVED MEMBER → DO NOT SHOW
            ========================================= */

            if(isApproved(member)){

                return;

            }


            /* =========================================
               PENDING MEMBER
            ========================================= */

            pendingFound = true;


            const photo =
                member.photoUrl ||
                "images/default-user.png";


            const paymentText =
                member.paid === true
                ? "✅ Paid"
                : "⏳ Pending";


            const memberId =
                member.memberId ||
                "-";


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

                        <b>Member ID:</b>

                        ${escapeHTML(memberId)}

                    </p>


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

                            ${paymentText}

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

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =====================================================
   APPROVE MEMBER
===================================================== */

window.approveMember =
async function(id){

    try{

        /* =============================================
           GET MEMBER
        ============================================= */

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


        /* =============================================
           ALREADY APPROVED CHECK
        ============================================= */

        if(isApproved(member)){

            alert(
                "ℹ️ ଏହି Member ପୂର୍ବରୁ Approved ହୋଇଛନ୍ତି।"
            );

            loadPendingMembers();

            return;

        }


        /* =============================================
           MEMBER NAME
        ============================================= */

        const memberName =
            member.name ||
            "Member";


        /* =============================================
           CONFIRM
        ============================================= */

        const confirmApprove =
            confirm(
                "✅ ଏହି Member କୁ Approve କରିବେ?\n\n" +
                "Member: " +
                memberName +
                "\n\n" +
                "Approval ମାତ୍ର Approved ହେବ।\n" +
                "Payment status ବଦଳିବ ନାହିଁ।"
            );


        if(!confirmApprove){

            return;

        }


        /* =============================================
           APPROVE ONLY
           
           IMPORTANT:
           - Member ID unchanged
           - paid unchanged
           - txnId unchanged
           - paymentMode unchanged
           - income NOT created
        ============================================= */

        await updateDoc(

            memberRef,

            {

                approval:
                    "approved",

                approved:
                    true,

                status:
                    "approved"

            }

        );


        /* =============================================
           SUCCESS
        ============================================= */

        alert(
            "✅ Member Successfully Approved\n\n" +

            "Member ID: " +
            (
                member.memberId ||
                "-"
            ) +

            "\n\n" +

            "💳 Payment: " +

            (
                member.paid === true
                ? "Paid"
                : "Pending"
            )
        );


        /* =============================================
           RELOAD
        ============================================= */

        await loadPendingMembers();

    }

    catch(error){

        console.error(
            "Approve Error:",
            error
        );


        alert(
            "❌ Approval failed:\n\n" +
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


        /* =============================================
           CONFIRM DELETE
        ============================================= */

        const ok =
            confirm(
                "⚠️ ଏହି Pending Member କୁ Delete କରିବେ?\n\n" +

                "Member: " +
                (
                    member.name ||
                    "Member"
                ) +

                "\n\n" +

                "ଏହା Members collection ରୁ record delete କରିବ।"
            );


        if(!ok){

            return;

        }


        /* =============================================
           DELETE
        ============================================= */

        await deleteDoc(
            memberRef
        );


        /* =============================================
           SUCCESS
        ============================================= */

        alert(
            "❌ Pending Member Rejected Successfully"
        );


        /* =============================================
           RELOAD
        ============================================= */

        await loadPendingMembers();

    }

    catch(error){

        console.error(
            "Reject Error:",
            error
        );


        alert(
            "❌ Reject failed:\n\n" +
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
    "✅ Pending Members Approval System Loaded"
);
