import { writable } from 'svelte/store';

// Create a custom store
function createUserCheckStateStore() {
	const { subscribe, set, update } = writable({});

	// Function to update the check state for a specific user
	function updateCheckState(userId: number, isChecked: boolean) {
		update((state) => {
			return { ...state, [userId]: isChecked };
		});
	}

	// Resets the entire state, useful for clearing all selections
	function reset() {
		set({});
	}

	return {
		subscribe,
		updateCheckState,
		reset
	};
}

// Instantiate the store
export const userCheckState = createUserCheckStateStore();

// Example usage of updateCheckState
// userCheckState.updateCheckState('userId123', true);
