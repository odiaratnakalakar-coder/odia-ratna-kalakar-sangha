// =====================================
// Trust Accounts V2
// Part 1
// Firebase Setup
// =====================================

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firestore Collections

const membersRef = collection(db, "members");
const incomeRef = collection(db, "income");
const expensesRef = collection(db, "expenses");

// Dashboard Elements

const totalMembersEl = document.getElementById("totalMembers");
const memberIncomeEl = document.getElementById("memberIncome");
const totalDonationEl = document.getElementById("totalDonation");
const totalExpenseEl = document.getElementById("totalExpense");
const totalIncomeEl = document.getElementById("totalIncome");
const currentBalanceEl = document.getElementById("currentBalance");

// Member Fee

const MEMBER_FEE = 1200;

// Variables

let totalMembers = 0;
let memberIncome = 0;
let totalDonation = 0;
let totalExpense = 0;
