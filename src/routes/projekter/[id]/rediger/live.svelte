<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;

	export let form: any;

	import { ProjectEditMode } from '$lib/types';

	import { Pen } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';

	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
	import SaveOrDisgardButtons from './SaveOrDisgardButtons.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div class="mb-8 mt-16 flex w-full gap-2">
	{#if ProjectEditMode.live === FieldToEdit}
		<form
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					dispatch('update');
					update();
				};
			}}
			class="flex w-full flex-col gap-2"
			method="POST"
			action="?/updateLive"
		>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="livemode" class="text-lg">Udgivelsestidpunkt</Label>
				<div>
					<input
						checked={form?.formData?.live
							? form?.formData?.live === 'yes'
								? true
								: false
							: project.live}
						type="radio"
						name="live"
						value="yes"
					/>
					<Label for="livemode">Udgiv nu</Label>
				</div>
				<div>
					<input
						checked={form?.formData?.live
							? form?.formData?.live === 'no'
								? true
								: false
							: !project.live}
						type="radio"
						name="live"
						value="no"
					/>
					<Label for="livemode">Gem klade og udgiv senere</Label>
				</div>
			</div>
			<SaveOrDisgardButtons bind:FieldToEdit />
		</form>
	{:else}
		<div class="flex flex-col">
			<div class="flex items-center gap-2">
				<h2 class="mb-1 text-xl font-bold">Synlig for alle?</h2>
				<Button
					size="icon"
					variant="ghost"
					on:click={() => {
						FieldToEdit = ProjectEditMode.live;
					}}
				>
					<Pen class="h-5 w-5" />
				</Button>
			</div>
			<p class="text max-w-[40rem] font-light leading-7">
				{form?.formData?.live
					? form?.formData?.live === 'yes'
						? 'ja'
						: 'nej'
					: project.live
						? 'ja'
						: 'nej'}
			</p>
		</div>
	{/if}
</div>
