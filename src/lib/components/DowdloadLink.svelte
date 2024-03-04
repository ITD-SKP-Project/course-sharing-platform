<script lang="ts">
	export let pathName: string; // Replace with the desired file name

	import { Toaster } from '$lib/components/ui/sonner';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	async function downloadFile() {
		console.log('🚀 ~ downloadFile ~ pathName:', pathName);
		const response = await fetch(`/api/files/download`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ pathName: pathName })
		});
		if (!response.ok) {
			let data = (await response.json()) as unknown as { message: string };
			console.log('🚀 ~ downloadFile ~ data:', data);
			toast('Fejl. Linket virker ikke.', {
				description: data.message
			});
		} else {
			const blob = await response.blob();
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = pathName;
			link.click();
		}
	}
</script>

<Button class="m-0 p-0 text-primary-foreground" variant="link" on:click={downloadFile}>
	<slot />
</Button>
<Toaster />
