<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	import { Button } from '$lib/components/ui/button';
</script>

<Button
	on:click={async () => {
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ password: 'password', email: 'kenn7575@gmail.com' })
		});
		console.log(response);
	}}>login</Button
>
