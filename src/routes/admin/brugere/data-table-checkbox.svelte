<script lang="ts">
	import type { Writable } from 'svelte/store';
	export let checked: Writable<boolean>;

	export let value: number | string;
	import { userCheckState } from './checkListStore';
</script>

<div class="flex items-center gap-2">
	<input type="checkbox" bind:checked={$checked} />
	<p>{value}</p>
</div>
