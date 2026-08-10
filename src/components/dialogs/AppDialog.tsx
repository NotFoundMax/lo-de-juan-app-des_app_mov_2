import { Modal, Text, TouchableOpacity, View } from "react-native";

export interface DialogOptions {
  title: string;
  message?: string;
  type: "alert" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface Props {
  options: DialogOptions | null;
  onClose: () => void;
}

// Diálogo cross-platform (desktop web y móvil) con el look de la app
export default function AppDialog({ options, onClose }: Props) {
  if (!options) return null;

  const cancelLabel = options.cancelLabel ?? "Cancelar";
  const confirmLabel =
    options.confirmLabel ?? (options.destructive ? "Eliminar" : "Aceptar");

  const handleCancel = () => {
    options.onCancel?.();
    onClose();
  };

  const handleConfirm = () => {
    options.onConfirm?.();
    onClose();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={options.type === "alert" ? onClose : undefined}
    >
      <View className="flex-1 bg-black/50 justify-center px-4">
        <View className="bg-white rounded-2xl p-6">
          <Text className="text-h3 text-text-primary mb-2">{options.title}</Text>
          {options.message ? (
            <Text className="text-body text-text-secondary mb-6">
              {options.message}
            </Text>
          ) : null}

          {options.type === "alert" ? (
            <TouchableOpacity
              className="bg-primary py-3 rounded-xl items-center"
              onPress={onClose}
            >
              <Text className="text-body-bold text-white">Aceptar</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-surface border border-border py-3 rounded-xl items-center"
                onPress={handleCancel}
              >
                <Text className="text-body-bold text-text-primary">
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${
                  options.destructive ? "" : "bg-primary"
                }`}
                style={
                  options.destructive
                    ? { backgroundColor: "#dc2626" }
                    : undefined
                }
                onPress={handleConfirm}
              >
                <Text className="text-body-bold text-white">
                  {confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
