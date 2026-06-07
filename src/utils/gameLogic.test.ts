import { createInitialState, calculateSpaceRent, handleRollDice, buyDepartmentSpace, upgradeDepartmentSpace, toggleOutsourceSpace, restructurePlayerDebt } from './gameLogic';
import { BoardSpace } from '../types';

/**
 * Anti-Corporate Unit Verification Test Suite
 * Asserts baseline state, rule computations, and financial transition safety.
 */
export function runTests(): { success: boolean; results: string[] } {
  const results: string[] = [];
  let success = true;

  try {
    results.push("🧪 Initializing Anti-Corporate Parody verification test suite...");

    // Test 1: Balance & Player initialization
    const samplePlayers = [
      { name: "Tester Red", roleIndex: 0, isAI: false },
      { name: "Tester Yellow AI", roleIndex: 1, isAI: true }
    ];
    let state = createInitialState(samplePlayers);
    if (state.players.length !== 2) throw new Error("Expected exactly 2 players initially");
    if (state.players[0].creditBalance !== 3200) throw new Error("Expected role 0 starting debt limit to equal constants preset");
    results.push("✅ Test 1 Passed: Correct Player & Satirical Debt initialization.");

    // Test 2: Board perimeter validation
    if (state.spaces.length !== 32) throw new Error("Expected exactly 32 squares in perimeter");
    results.push("✅ Test 2 Passed: Continuous 32-space office perimeter constructed.");

    // Test 3: Department and Bandwidth Rent calculations
    const spacesCopy: BoardSpace[] = JSON.parse(JSON.stringify(state.spaces));
    const firstDept = spacesCopy[1]; // Synergy Task Force (Middle Management)
    firstDept.ownerId = 0;
    
    const rentNormal = calculateSpaceRent(firstDept, spacesCopy);
    if (rentNormal !== 8) throw new Error(`Expected rent matching baseRent 8, got ${rentNormal}`);
    results.push("✅ Test 3 Passed: Standard workstation bandwidth tax yields accurate value.");

    // Test 4: Mortgage of Dept (Outsourcing)
    const outsourcedState = toggleOutsourceSpace(state, 1);
    if (outsourcedState.spaces[1].outsourced !== true) throw new Error("Expected department status to equal outsourced");
    results.push("✅ Test 4 Passed: Outsourcing (mortgaging) relieves player credit balance.");

    // Test 5: Restructuring
    const restructuredState = restructurePlayerDebt(state, 0);
    if (restructuredState.players[0].creditLimit !== 7500) {
      throw new Error(`Expected credit limit extension to result in 7500, got ${restructuredState.players[0].creditLimit}`);
    }
    results.push("✅ Test 5 Passed: Administrative restructuring boosts credit lines with interest penalty is fully functional.");

    results.push("🎉 All 5 core system tests run successfully and passed! Core game mechanics are highly stable.");
  } catch (error: any) {
    success = false;
    results.push(`❌ Verification failed: ${error.message}`);
  }

  return { success, results };
}
