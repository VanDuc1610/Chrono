import { MovementDirection } from '../movement/IMovementSystem';

export interface ControllerActions {
  interact: boolean;
  cancel: boolean;
  menu: boolean;
  actionPressed: boolean;
}

export interface IPlayerController {
  /**
   * Reads current input intent for movement direction.
   */
  getMovementVector(): MovementDirection;

  /**
   * Reads action buttons state (interact, cancel, menu).
   */
  getActions(): ControllerActions;

  /**
   * Resets transient trigger states (e.g. key-just-down).
   */
  update(): void;

  /**
   * Enables or disables controller input (e.g. during cutscenes or dialogue).
   */
  setEnabled(enabled: boolean): void;

  /**
   * Query controller active state.
   */
  isEnabled(): boolean;
}

