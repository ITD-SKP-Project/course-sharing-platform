<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { ActionData } from '../../../routes/$types';

	// todo: save to localstorage
	export let form: ActionData;
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
					name="it_supporter"
					checked={form?.formData?.infrastruktur_skill_level}
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
					name="it_supporter_skill_level"
					value={form?.formData?.it_supporter_skill_level}
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
					name="datatekniker"
					checked={form?.formData?.programmering_skill_level}
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
					value={form?.formData?.programmering_skill_level}
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
					name="datatekniker"
					checked={form?.formData?.infrastruktur_skill_level}
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
					value={form?.formData?.infrastruktur_skill_level}
					type="niveau"
					id="infrastruktur-niveau"
					placeholder="H2 eller GF1"
				/>
			</div>
		</div>
	</div>
</div>
