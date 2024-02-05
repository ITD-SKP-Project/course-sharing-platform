<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;

	$: console.log(form);
	$: if (form?.projectId) {
		goto(`/projekter/${form.projectId}`);
	}

	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Plus, X } from 'lucide-svelte';

	let itSupoter = false;
	let programmering = false;
	let infrastruktur = false;

	let testArray: string[] = [''];
	let reRender = false;
</script>

<main class="mb-16 flex flex-col gap-8 p-2 sm:p-8">
	<div class="mx-auto">
		<h1 class="text-4xl font-semibold">Opret et nyt projekt.</h1>
		<p class="text mt-2">Udfyld alle felterne, og tryk på offentliggør for at lægge det op.</p>

		<form
			method="POST"
			use:enhance
			class="mt-8 flex w-full max-w-lg flex-col gap-12"
			enctype="multipart/form-data"
		>
			<!-- ? title -->
			<div class="flex w-full flex-col gap-1.5">
				<Label for="title" class="text-lg">Title</Label>
				<Input
					name="title"
					value={form?.formData?.title}
					type="text"
					id="title"
					placeholder="Title"
				/>
				<p class="text-sm text-muted-foreground">Titlen på projektets.</p>
				{#if form?.validationErrors?.title}
					<p class="text-red-500">{form?.validationErrors?.title}</p>
				{/if}
			</div>
			<!-- ? description -->
			<div class="flex w-full flex-col gap-1.5">
				<Label class="text-lg" for="description">Description</Label>
				<Textarea
					name="description"
					value={form?.formData?.description}
					id="description"
					placeholder="Description"
				/>
				<p class="text-sm text-muted-foreground">
					En kort forklaring af projektet. Hvad handler det om?
				</p>
				{#if form?.validationErrors?.description}
					<p class="text-red-500">{form?.validationErrors?.description}</p>
				{/if}
			</div>
			<!-- ? professions -->
			<div>
				<Label class="text-lg" for="profession-section">Uddannelser</Label>
				<div class="flex flex-col gap-4 sm:gap-2">
					<div
						id="profession-section"
						class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
					>
						<div>
							<input
								on:input={(e) => {
									itSupoter = e.target?.checked || false;
								}}
								type="checkbox"
								name="it_supporter"
								checked={form?.formData?.it_supporter}
								id="it_supporter"
								aria-labelledby="it_supporter_label"
							/>
							<Label
								id="it_supporter_label"
								for="it_supporter"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								It-supporter
							</Label>
							{#if form?.validationErrors?.it_supporter}
								<p class="text-red-500">{form?.validationErrors?.it_supporter}</p>
							{/if}
						</div>

						<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
							<Label for="it-supporter_niveau">Niveau</Label>
							<Input
								disabled={!itSupoter}
								required={itSupoter}
								name="it_supporter_skill_level"
								value={form?.formData?.it_supporter_skill_level}
								type="text"
								id="it_supporter_niveau"
								placeholder="H2 eller GF1"
							/>
							{#if form?.validationErrors?.it_supporter_skill_level}
								<p class="text-red-500">{form?.validationErrors?.it_supporter_skill_level}</p>
							{/if}
						</div>
					</div>
					<div
						id="profession-section"
						class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
					>
						<div>
							<input
								on:input={(e) => {
									programmering = e.target?.checked || false;
								}}
								type="checkbox"
								name="programmering"
								checked={form?.formData?.programmering}
								id="programmering"
								aria-labelledby="programmering_label"
							/>
							{#if form?.validationErrors?.programmering}
								<p class="text-red-500">{form?.validationErrors?.programmering}</p>
							{/if}
							<Label
								id="programmering_label"
								for="programmering"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Datatekniker med speciale i programmering
							</Label>
						</div>
						<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
							<Label for="programmering_niveau">Niveau</Label>
							<Input
								disabled={!programmering}
								required={programmering}
								value={form?.formData?.programmering_skill_level}
								type="text"
								id="programmering_niveau"
								placeholder="H2 eller GF1"
								name="programmering_skill_level"
							/>
							{#if form?.validationErrors?.programmering_skill_level}
								<p class="text-red-500">{form?.validationErrors?.programmering_skill_level}</p>
							{/if}
						</div>
					</div>
					<div
						id="profession-section"
						class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
					>
						<div>
							<input
								on:input={(e) => {
									infrastruktur = e.target?.checked || false;
								}}
								type="checkbox"
								checked={form?.formData?.infrastruktur}
								name="infrastruktur"
								id="infrastruktur"
								aria-labelledby="infrastruktur-label"
							/>

							<Label
								id="infrastruktur-label"
								for="infrastruktur"
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Datatekniker med speciale i infrastruktur
							</Label>
							{#if form?.validationErrors?.infrastruktur}
								<p class="text-red-500">{form?.validationErrors?.infrastruktur}</p>
							{/if}
						</div>
						<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
							<Label for="infrastruktur_niveau">Niveau</Label>
							<Input
								disabled={!infrastruktur}
								required={infrastruktur}
								value={form?.formData?.infrastruktur_skill_level}
								type="text"
								id="infrastruktur_niveau"
								placeholder="H2 eller GF1"
								name="infrastruktur_skill_level"
							/>
							{#if form?.validationErrors?.infrastruktur_skill_level}
								<p class="text-red-500">{form?.validationErrors?.infrastruktur_skill_level}</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
			<!-- ? subjects -->
			<div>
				<Label for="subjects" class="text-lg">Fag</Label>
				{#key form || reRender}
					{#each testArray as item, index}
						<div class="flex gap-2">
							<Input
								on:input={(e) => {
									testArray[index] = e.target?.value;
								}}
								type="text"
								name="subjects-{index}"
								value={testArray[index] ?? form?.formData[`subjects-${index}`] ?? ''}
								placeholder="Cisco"
							/>
							<Button
								size="icon"
								class="aspect-square"
								variant="destructive"
								on:click={() => {
									testArray = testArray.toSpliced(index, 1); // Remove the item at the specified index
									testArray = testArray;
									reRender = !reRender;
								}}
							>
								<X class=" h-4 w-4" />
							</Button>
						</div>

						{#if form?.validationErrors?.[`subjects-${index}`]}
							<p class="text-red-500">{form?.validationErrors?.[`subjects-${index}`]}</p>
						{/if}
					{/each}
				{/key}
				<Button
					class="mt-2 items-center justify-start"
					type="button"
					on:click={() => {
						testArray.push('');
						testArray = [...testArray];
					}}
				>
					<Plus class="mr-1.5 h-4 w-4" />
					Tilføj
				</Button>
			</div>
			<div class="flex w-full flex-col gap-1.5">
				<Label for="subjects" class="text-lg">Fag</Label>
				<Input
					name="subjects"
					value={form?.formData?.subjects}
					type="text"
					id="subjects"
					placeholder="subjects"
				/>
				<p class="text-sm text-muted-foreground">Hvilke fag bliver indravet i projektet.</p>
				{#if form?.validationErrors?.subjects}
					<p class="text-red-500">{form?.validationErrors?.subjects}</p>
				{/if}
			</div>

			<div class="flex w-full flex-col gap-1.5">
				<Label for="resources" class="text-lg">Ressourcer</Label>
				<Input
					name="resources"
					value={form?.formData?.resources}
					type="text"
					id="resources"
					placeholder="resources"
				/>
				<p class="text-sm text-muted-foreground">Hvilke fag bliver indravet i projektet.</p>
				{#if form?.validationErrors?.resources}
					<p class="text-red-500">{form?.validationErrors?.resources}</p>
				{/if}
			</div>

			<div>
				<Label for="file" class="text-lg">Filer</Label>
				<Input name="file" value={form?.formData?.file} type="file" id="file" placeholder="file" />
				<p class="text-sm text-muted-foreground">Hvilke fag bliver indravet i projektet.</p>
				{#if form?.validationErrors?.subjects}
					<p class="text-red-500">{form?.validationErrors?.file}</p>
				{/if}
			</div>

			<div class="flex w-full flex-col gap-1.5">
				<Label for="livemode" class="text-lg">Udgivelsestidpunkt</Label>
				<div>
					<input checked={true} type="radio" name="live" value="yes" />
					<Label for="livemode">Udgiv nu</Label>
				</div>
				<div>
					<input type="radio" name="live" value="no" />
					<Label for="livemode">Gem klade og udgiv senere</Label>
				</div>
			</div>

			<Button type="submit">Udgiv projekt</Button>
		</form>
	</div>
</main>

<style>
</style>
