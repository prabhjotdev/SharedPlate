import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { HouseholdState, Household, InviteCode, HouseholdMember, MemberPermission } from '../types'

const initialState: HouseholdState = {
  household: null,
  inviteCodes: [],
  loading: true,
  error: null,
}

const householdSlice = createSlice({
  name: 'household',
  initialState,
  reducers: {
    setHousehold: (state, action: PayloadAction<Household | null>) => {
      state.household = action.payload
      state.loading = false
    },
    setInviteCodes: (state, action: PayloadAction<InviteCode[]>) => {
      state.inviteCodes = action.payload
    },
    addInviteCode: (state, action: PayloadAction<InviteCode>) => {
      state.inviteCodes.push(action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    updateMemberPermission: (
      state,
      action: PayloadAction<{ uid: string; permission: MemberPermission }>
    ) => {
      if (state.household) {
        const member = state.household.members.find(m => m.uid === action.payload.uid)
        if (member) {
          member.permission = action.payload.permission
        }
      }
    },
    addMember: (state, action: PayloadAction<HouseholdMember>) => {
      if (state.household) {
        state.household.members.push(action.payload)
      }
    },
    removeMember: (state, action: PayloadAction<string>) => {
      if (state.household) {
        state.household.members = state.household.members.filter(
          m => m.uid !== action.payload
        )
      }
    },
    clearHousehold: (state) => {
      state.household = null
      state.inviteCodes = []
      state.loading = false
      state.error = null
    },
  },
})

export const {
  setHousehold,
  setInviteCodes,
  addInviteCode,
  setLoading,
  setError,
  updateMemberPermission,
  addMember,
  removeMember,
  clearHousehold,
} = householdSlice.actions

export default householdSlice.reducer
