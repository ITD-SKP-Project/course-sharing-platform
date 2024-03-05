<script lang="ts">
	export let FieldToEdit: ProjectEditMode;
	export let loading: boolean = false;
	export let project: Project;
	export let form: any;

	import { ProjectEditMode } from '$lib/types';

	import { Save, Trash, Pen } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { enhance } from '$app/forms';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let itSupoter = project?.professions?.find((p) => p.profession_id == 4) ? true : false;
	let programmering = project?.professions?.find((p) => p.profession_id == 5) ? true : false;
	let infrastruktur = project?.professions?.find((p) => p.profession_id == 6) ? true : false;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div class="mt-16">
	{#if ProjectEditMode.professions === FieldToEdit}
		{#if project.professions && project.professions.length > 0}
			<form
				action="?/updateProfessions"
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						dispatch('update');
						update();
					};
				}}
			>
				<Label for="profession-section">Uddannelser</Label>

				<div class="flex flex-col gap-4 sm:gap-2">
					<div
						id="profession-section"
						class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
					>
						<div>
							<input
								on:input={(e) => {
									itSupoter = e.target?.checked ? true : false;
								}}
								type="checkbox"
								name="it_supporter"
								checked={form?.formData?.it_supporter || itSupoter}
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
								value={form?.formData?.it_supporter_skill_level ||
									project.professions.find((p) => p.profession_id == 4)?.skill_level}
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
								checked={form?.formData?.programmering || programmering}
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
								value={form?.formData?.programmering_skill_level ||
									project.professions.find((p) => p.profession_id == 5)?.skill_level}
								type="text"
								id="programmering_niveau"
								placeholder="H2 eller GF1"
								name="programmering_skill_level"
							/>
							{#if form?.validationErrors?.programmering_skill_level}
								<p class="text-red-500">
									{form?.validationErrors?.programmering_skill_level}
								</p>
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
								checked={form?.formData?.infrastruktur || infrastruktur}
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
								value={form?.formData?.infrastruktur_skill_level ||
									project.professions.find((p) => p.profession_id == 6)?.skill_level}
								type="text"
								id="infrastruktur_niveau"
								placeholder="H2 eller GF1"
								name="infrastruktur_skill_level"
							/>
							{#if form?.validationErrors?.infrastruktur_skill_level}
								<p class="text-red-500">
									{form?.validationErrors?.infrastruktur_skill_level}
								</p>
							{/if}
						</div>
					</div>
				</div>
				<div class="flex gap-2">
					<Tooltip.Root>
						<Tooltip.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								size="icon"
								variant="destructive"
								on:click={() => {
									FieldToEdit = ProjectEditMode.title;

									//reset values
									itSupoter = project?.professions?.find((p) => p.profession_id == 4)
										? true
										: false;
									programmering = project?.professions?.find((p) => p.profession_id == 5)
										? true
										: false;
									infrastruktur = project?.professions?.find((p) => p.profession_id == 6)
										? true
										: false;
								}}
							>
								<Trash class="h-5 w-5" />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Annuller</p>
						</Tooltip.Content>
					</Tooltip.Root>

					<Tooltip.Root>
						<Tooltip.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								size="icon"
								class="bg-green-500 hover:bg-green-600 focus:ring-green-500"
								type="submit"
							>
								<Save class="h-5 w-5" />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Annuller</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</form>
		{/if}
	{:else}
		<div class="mb-8">
			<div class="flex items-center gap-2">
				<h2 class="mb-1 text-xl font-bold">Uddannelser</h2>
				<Button
					size="icon"
					variant="ghost"
					on:click={() => {
						FieldToEdit = ProjectEditMode.professions;
					}}
				>
					<Pen class="h-5 w-5" />
				</Button>
			</div>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Udd.</Table.Head>
						<Table.Head>Niveau</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if (form?.formData?.it_supporter && form?.formData?.it_supporter_skill_level) || project.professions?.find((p) => p.profession_id == 4)}
						<Table.Row>
							<Table.Cell>It-supporter</Table.Cell>
							<Table.Cell
								>{project.professions?.find((p) => p.profession_id == 4)?.skill_level ||
									form?.formData?.it_supporter_skill_level}</Table.Cell
							>
						</Table.Row>
					{/if}
					{#if (form?.formData?.programmering && form?.formData?.programmering_skill_level) || project.professions?.find((p) => p.profession_id == 5)}
						<Table.Row>
							<Table.Cell>Datatekniker med speciale i programmering</Table.Cell>
							<Table.Cell
								>{project.professions?.find((p) => p.profession_id == 5)?.skill_level ||
									form?.formData?.programmering_skill_level}</Table.Cell
							>
						</Table.Row>
					{/if}
					{#if project.professions?.find((p) => p.profession_id == 6)?.skill_level || (form?.formData?.infrastruktur && form?.formData?.infrastruktur_skill_level) || project.professions?.find((p) => p.profession_id == 6)}
						<Table.Row>
							<Table.Cell>Datatekniker med speciale i infrastruktur</Table.Cell>
							<Table.Cell>{form?.formData?.infrastruktur_skill_level}</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
