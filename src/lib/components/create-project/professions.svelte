<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { ProjectProfessionCreation } from '$lib/types';

	let itSupporter = {
		active: false,
		skill_level: '',
		profession_id: 4
	};
	let programmering = {
		active: false,
		skill_level: '',
		profession_id: 5
	};
	let infrastruktur = {
		active: false,
		skill_level: '',
		profession_id: 6
	};
	export let projectProfessions: ProjectProfessionCreation[] = [];

	// todo: save to localstorage
</script>

<div>
	<Label class="text-lg" for="profession-section">Uddannelser</Label>
	<div class="flex flex-col gap-4 sm:gap-2">
		<div
			id="profession-section"
			class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
		>
			<div>
				<Checkbox
					on:click={() => {
						if (!itSupporter.active) {
							/* its reversed because the bind:checked will change active*/ projectProfessions.push(
								{
									profession_id: itSupporter.profession_id,
									skill_level: itSupporter.skill_level,
									project_id: null
								}
							);
							projectProfessions = projectProfessions;
						} else {
							projectProfessions.splice(
								projectProfessions.findIndex((p) => {
									return p.profession_id === itSupporter.profession_id;
								}),
								1
							);
							projectProfessions = projectProfessions;
						}
					}}
					bind:checked={itSupporter.active}
					id="it-supporter"
					aria-labelledby="It-supporter-label"
				/>
				<Label
					id="it-supporter-label"
					for="it-supporter"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					It-supporter
				</Label>
			</div>
			<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
				<Label for="it-supporter-niveau">Niveau</Label>
				<Input
					on:input={() => {
						if (itSupporter.active) {
							projectProfessions.splice(
								projectProfessions.findIndex((p) => {
									return p.profession_id === itSupporter.profession_id;
								}),
								1
							);
							projectProfessions.push({
								profession_id: itSupporter.profession_id,
								skill_level: itSupporter.skill_level,
								project_id: null
							});
							projectProfessions = projectProfessions;
						}
					}}
					bind:value={itSupporter.skill_level}
					disabled={!itSupporter.active}
					type="text"
					id="it-supporter-niveau"
					placeholder="H2 eller GF1"
				/>
			</div>
		</div>
		<div
			id="profession-section"
			class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
		>
			<div>
				<Checkbox
					on:click={() => {
						if (!programmering.active) {
							/* its reversed because the bind:checked will change active*/ projectProfessions.push(
								{
									profession_id: programmering.profession_id,
									skill_level: programmering.skill_level,
									project_id: null
								}
							);
							projectProfessions = projectProfessions;
						} else {
							projectProfessions.splice(
								projectProfessions.findIndex((p) => {
									return p.profession_id === programmering.profession_id;
								}),
								1
							);
							projectProfessions = projectProfessions;
						}
					}}
					bind:checked={programmering.active}
					id="programmering"
					aria-labelledby="programmering-label"
				/>
				<Label
					id="programmering-label"
					for="programmering"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Datatekniker med speciale i programmering
				</Label>
			</div>
			<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
				<Label for="niveau">Niveau</Label>
				<Input
					on:input={() => {
						if (programmering.active) {
							projectProfessions.splice(
								projectProfessions.findIndex((p) => {
									return p.profession_id === programmering.profession_id;
								}),
								1
							);
							projectProfessions.push({
								profession_id: programmering.profession_id,
								skill_level: programmering.skill_level,
								project_id: null
							});
							projectProfessions = projectProfessions;
						}
					}}
					bind:value={programmering.skill_level}
					disabled={!programmering.active}
					type="programmering-niveau"
					id="programmering-niveau"
					placeholder="H2 eller GF1"
				/>
			</div>
		</div>
		<div
			id="profession-section"
			class="flex flex-col items-start justify-between space-x-2 sm:flex-row sm:items-center"
		>
			<div>
				<Checkbox
					on:click={() => {
						if (!infrastruktur.active) {
							/* its reversed because the bind:checked will change active*/ projectProfessions.push(
								{
									profession_id: infrastruktur.profession_id,
									skill_level: infrastruktur.skill_level,
									project_id: null
								}
							);
							projectProfessions = projectProfessions;
						} else {
							projectProfessions.splice(
								projectProfessions.findIndex((p) => {
									return p.profession_id === infrastruktur.profession_id;
								}),
								1
							);
							projectProfessions = projectProfessions;
						}
					}}
					bind:checked={infrastruktur.active}
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
			</div>
			<div class="mt-2 flex w-full max-w-56 flex-col gap-1.5 sm:mt-0">
				<Label for="infrastruktur-niveau">Niveau</Label>
				<Input
					on:input={() => {
						if (infrastruktur.active) {
							projectProfessions.splice(
								projectProfessions.findIndex((p) => {
									return p.profession_id === infrastruktur.profession_id;
								}),
								1
							);
							projectProfessions.push({
								profession_id: infrastruktur.profession_id,
								skill_level: infrastruktur.skill_level,
								project_id: null
							});
							projectProfessions = projectProfessions;
						}
					}}
					bind:value={infrastruktur.skill_level}
					disabled={!infrastruktur.active}
					type="niveau"
					id="infrastruktur-niveau"
					placeholder="H2 eller GF1"
				/>
			</div>
		</div>
	</div>
</div>
