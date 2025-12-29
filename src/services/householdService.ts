import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Household, HouseholdMember, InviteCode, MemberPermission, User } from '../types'

// Generate a random 6-character invite code
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoid confusing chars like 0/O, 1/I/L
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new household
export async function createHousehold(name: string, user: User): Promise<Household> {
  const householdRef = doc(collection(db, 'households'))

  const member: HouseholdMember = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: 'owner',
    permission: 'full',
    joinedAt: new Date(),
  }

  const household: Omit<Household, 'id'> = {
    name,
    createdBy: user.uid,
    createdAt: new Date(),
    members: [member],
  }

  await setDoc(householdRef, {
    ...household,
    createdAt: serverTimestamp(),
    memberUids: [user.uid], // For security rules membership check
    members: [{
      ...member,
      joinedAt: Timestamp.now(),
    }],
  })

  return { id: householdRef.id, ...household }
}

// Get household by ID
export async function getHousehold(householdId: string): Promise<Household | null> {
  const householdRef = doc(db, 'households', householdId)
  const householdSnap = await getDoc(householdRef)

  if (!householdSnap.exists()) {
    return null
  }

  const data = householdSnap.data()
  return {
    id: householdSnap.id,
    name: data.name,
    createdBy: data.createdBy,
    createdAt: data.createdAt?.toDate() || new Date(),
    members: data.members.map((m: HouseholdMember & { joinedAt: Timestamp }) => ({
      ...m,
      joinedAt: m.joinedAt?.toDate?.() || new Date(),
    })),
  }
}

// Find household for a user (by their uid)
export async function findUserHousehold(uid: string): Promise<Household | null> {
  const householdsRef = collection(db, 'households')
  const q = query(householdsRef)
  const snapshot = await getDocs(q)

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    const isMember = data.members?.some((m: HouseholdMember) => m.uid === uid)
    if (isMember) {
      return {
        id: docSnap.id,
        name: data.name,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        members: data.members.map((m: HouseholdMember & { joinedAt: Timestamp }) => ({
          ...m,
          joinedAt: m.joinedAt?.toDate?.() || new Date(),
        })),
      }
    }
  }

  return null
}

// Generate an invite code
export async function createInviteCode(householdId: string, householdName: string, createdBy: string): Promise<InviteCode> {
  const code = generateCode()
  const codeRef = doc(collection(db, 'inviteCodes'))

  const inviteCode: Omit<InviteCode, 'id'> = {
    code,
    householdId,
    householdName,
    createdBy,
    createdAt: new Date(),
    expiresAt: null, // Never expires
    used: false,
  }

  await setDoc(codeRef, {
    ...inviteCode,
    createdAt: serverTimestamp(),
    expiresAt: null, // Never expires
  })

  return { id: codeRef.id, ...inviteCode }
}

// Validate and get invite code
export async function validateInviteCode(code: string): Promise<InviteCode | null> {
  const codesRef = collection(db, 'inviteCodes')
  const q = query(codesRef, where('code', '==', code.toUpperCase()), where('used', '==', false))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    return null
  }

  const docSnap = snapshot.docs[0]
  const data = docSnap.data()

  // Invite codes never expire - no expiration check needed

  return {
    id: docSnap.id,
    code: data.code,
    householdId: data.householdId,
    householdName: data.householdName,
    createdBy: data.createdBy,
    createdAt: data.createdAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate() || null,
    used: data.used,
  }
}

// Join household with invite code
export async function joinHouseholdWithCode(code: string, user: User): Promise<Household> {
  const inviteCode = await validateInviteCode(code)

  if (!inviteCode) {
    throw new Error('Invalid or expired invite code')
  }

  // Check if user is already in a household
  const existingHousehold = await findUserHousehold(user.uid)
  if (existingHousehold) {
    throw new Error('You are already a member of a household')
  }

  const householdRef = doc(db, 'households', inviteCode.householdId)

  const newMember = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: 'member',
    permission: 'full',
    joinedAt: Timestamp.now(),
  }

  await updateDoc(householdRef, {
    members: arrayUnion(newMember),
    memberUids: arrayUnion(user.uid), // For security rules membership check
  })

  // Mark invite code as used (optional - you might want to allow multiple uses)
  // await updateDoc(doc(db, 'inviteCodes', inviteCode.id), { used: true })

  const household = await getHousehold(inviteCode.householdId)
  if (!household) {
    throw new Error('Failed to fetch household after joining')
  }

  return household
}

// Update member permission
export async function updateMemberPermission(
  householdId: string,
  memberUid: string,
  permission: MemberPermission
): Promise<void> {
  const household = await getHousehold(householdId)
  if (!household) {
    throw new Error('Household not found')
  }

  const updatedMembers = household.members.map(m =>
    m.uid === memberUid ? { ...m, permission } : m
  )

  await updateDoc(doc(db, 'households', householdId), {
    members: updatedMembers.map(m => ({
      ...m,
      joinedAt: Timestamp.fromDate(m.joinedAt),
    })),
  })
}

// Remove member from household
export async function removeMemberFromHousehold(
  householdId: string,
  memberUid: string
): Promise<void> {
  const household = await getHousehold(householdId)
  if (!household) {
    throw new Error('Household not found')
  }

  const memberToRemove = household.members.find(m => m.uid === memberUid)
  if (!memberToRemove) {
    throw new Error('Member not found')
  }

  if (memberToRemove.role === 'owner') {
    throw new Error('Cannot remove the household owner')
  }

  const updatedMembers = household.members.filter(m => m.uid !== memberUid)

  await updateDoc(doc(db, 'households', householdId), {
    members: updatedMembers.map(m => ({
      ...m,
      joinedAt: Timestamp.fromDate(m.joinedAt),
    })),
    memberUids: arrayRemove(memberUid), // Remove from security rules array
  })
}

// Leave household
export async function leaveHousehold(householdId: string, uid: string): Promise<void> {
  await removeMemberFromHousehold(householdId, uid)
}

// Get active invite codes for a household
export async function getHouseholdInviteCodes(householdId: string): Promise<InviteCode[]> {
  const codesRef = collection(db, 'inviteCodes')
  const q = query(codesRef, where('householdId', '==', householdId), where('used', '==', false))
  const snapshot = await getDocs(q)

  // Invite codes never expire - return all unused codes
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      code: data.code,
      householdId: data.householdId,
      householdName: data.householdName,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || null,
      used: data.used,
    }
  })
}
