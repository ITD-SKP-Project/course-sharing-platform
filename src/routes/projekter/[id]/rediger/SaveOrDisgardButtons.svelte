<script>
	import { Trash, Save } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export let FieldToEdit;
	import { ProjectEditMode } from '$lib/types';
</script>

<div>
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				size="icon"
				variant="destructive"
				on:click={() => {
					FieldToEdit = ProjectEditMode.none;
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
			<p>Gem</p>
		</Tooltip.Content>
	</Tooltip.Root>
</div>
