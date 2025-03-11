import {
  Alert,
  Button,
  DialogRootProvider,
  Icon,
  Input,
  Text,
  useDialog,
} from "@chakra-ui/react";
import { useState } from "react";
import { IoClose, IoSave } from "react-icons/io5";
import { useTeamCreate } from "../../utils/hooks";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

interface CreateTeamDialogProps {
  /**
   * Dialog is controlled externally
   */
  dialog: ReturnType<typeof useDialog>;

  /**
   * Function to call when team is successfully created
   */
  onTeamCreated: () => void;

  /**
   * Button to trigger the dialog
   */
  triggerButton: React.ReactNode;
}

/**
 * Dialog for creating a new team
 */
export function CreateTeamDialog({
  dialog,
  onTeamCreated,
  triggerButton,
}: CreateTeamDialogProps) {
  // Form state
  const [teamName, setTeamName] = useState("");
  const [initialRating, setInitialRating] = useState<string>("1200");

  // Custom hook for team creation
  const {
    createTeam,
    isCreating: isCreatingTeam,
    createError,
  } = useTeamCreate();

  async function handleCreateTeam() {
    // Determine if the current player should be added to the new team
    let player1Id = undefined;

    // Create the team
    const createdTeam = await createTeam(teamName, initialRating, player1Id);

    if (createdTeam) {
      // Reset form fields
      setTeamName("");
      setInitialRating("1200");

      // Close the dialog
      dialog.setOpen(false);

      // Refresh the teams list to ensure consistency
      onTeamCreated();
    }
  }

  return (
    <DialogRootProvider value={dialog}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field label="Team name">
            <Input
              placeholder="Enter name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </Field>
          <Field label="Initial rating">
            <Input
              type="number"
              placeholder="Enter rating..."
              value={initialRating}
              onChange={(e) => setInitialRating(e.target.value)}
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              The default rating is 1200. Higher values indicate stronger teams.
            </Text>
          </Field>

          {createError && (
            <Alert.Root status="error" mt={2}>
              <Alert.Indicator />
              <Alert.Title>{createError}</Alert.Title>
            </Alert.Root>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button>
              <Icon as={IoClose} mr={2} /> Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            onClick={handleCreateTeam}
            loading={isCreatingTeam}
            loadingText="Creating..."
            disabled={isCreatingTeam || !teamName.trim()}
          >
            <Icon as={IoSave} mr={2} /> Save
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRootProvider>
  );
}
