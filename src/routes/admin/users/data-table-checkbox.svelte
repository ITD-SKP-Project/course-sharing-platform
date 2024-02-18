<script lang="ts">
	import type { Writable } from 'svelte/store';
	export let checked: Writable<boolean>;
</script>

<input type="checkbox" bind:checked={$checked} />
