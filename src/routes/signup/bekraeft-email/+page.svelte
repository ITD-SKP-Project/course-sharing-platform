<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	export let data: PageData;
	if (data.verified) {
		goto('/signup/bruger-info');
	}
</script>

Bekræft din email
