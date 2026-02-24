"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import {
  fallbackModels,
  getSelectedModel,
  setSelectedModel,
  useLocalModels,
} from "@/hooks/presentation/useLocalModels";
import {
  AI_MODELS,
  getAIModelById,
  getProviderDisplayName,
  type AIProvider,
} from "@/lib/ai-models-config";
import { usePresentationState } from "@/states/presentation-state";
import { Bot, Cpu, Loader2, Monitor, Sparkles, Brain, Zap } from "lucide-react";
import { useEffect, useRef } from "react";

export function ModelPicker({
  shouldShowLabel = true,
}: {
  shouldShowLabel?: boolean;
}) {
  const { modelProvider, setModelProvider, modelId, setModelId } =
    usePresentationState();

  const { data: modelsData, isLoading, isInitialLoad } = useLocalModels();
  const hasRestoredFromStorage = useRef(false);

  // Load saved model selection from localStorage on mount
  useEffect(() => {
    if (!hasRestoredFromStorage.current) {
      const savedModel = getSelectedModel();
      if (savedModel) {
        console.log("Restoring model from localStorage:", savedModel);
        setModelProvider(
          savedModel.modelProvider as "openai" | "google" | "anthropic" | "mistral" | "cohere" | "ollama" | "lmstudio",
        );
        setModelId(savedModel.modelId);
      }
      hasRestoredFromStorage.current = true;
    }
  }, [setModelProvider, setModelId]);

  // Use cached data if available, otherwise show fallback
  const displayData = modelsData || {
    localModels: fallbackModels,
    downloadableModels: [],
    showDownloadable: true,
  };

  const { localModels, downloadableModels, showDownloadable } = displayData;

  // Group models by provider
  const ollamaModels = localModels.filter(
    (model) => model.provider === "ollama",
  );
  const lmStudioModels = localModels.filter(
    (model) => model.provider === "lmstudio",
  );
  const downloadableOllamaModels = downloadableModels.filter(
    (model) => model.provider === "ollama",
  );

  // Helper function to create model option
  const createModelOption = (
    model: (typeof localModels)[0],
    isDownloadable = false,
  ) => ({
    id: model.id,
    label: model.name,
    displayLabel:
      model.provider === "ollama"
        ? `ollama ${model.name}`
        : `lm-studio ${model.name}`,
    icon: model.provider === "ollama" ? Cpu : Monitor,
    description: isDownloadable
      ? `Downloadable ${model.provider === "ollama" ? "Ollama" : "LM Studio"} model (will auto-download)`
      : `Local ${model.provider === "ollama" ? "Ollama" : "LM Studio"} model`,
    isDownloadable,
  });

  // Get provider icon
  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case "openai":
        return Bot;
      case "google":
        return Sparkles;
      case "anthropic":
        return Brain;
      case "mistral":
      case "cohere":
        return Zap;
      case "ollama":
        return Cpu;
      case "lmstudio":
        return Monitor;
      default:
        return Bot;
    }
  };

  // Get current model value
  const getCurrentModelValue = () => {
    if (modelProvider === "ollama") {
      return `ollama-${modelId}`;
    } else if (modelProvider === "lmstudio") {
      return `lmstudio-${modelId}`;
    } else if (modelId) {
      return `${modelProvider}-${modelId}`;
    }
    return modelProvider;
  };

  // Get current model option for display
  const getCurrentModelOption = () => {
    // Check cloud AI models from config
    if (modelId) {
      const aiModel = getAIModelById(modelId);
      if (aiModel) {
        return {
          label: aiModel.name,
          icon: getProviderIcon(aiModel.provider),
        };
      }
    }

    // Check local ollama models
    const ollamaLocalModel = localModels.find(
      (model) => model.id === `ollama-${modelId}`,
    );
    if (ollamaLocalModel) {
      return {
        label: ollamaLocalModel.name,
        icon: Cpu,
      };
    }

    // Check local lmstudio models
    const lmstudioLocalModel = localModels.find(
      (model) => model.id === `lmstudio-${modelId}`,
    );
    if (lmstudioLocalModel) {
      return {
        label: lmstudioLocalModel.name,
        icon: Monitor,
      };
    }

    // Check downloadable models
    const downloadableModel = downloadableModels.find(
      (model) =>
        model.id === `ollama-${modelId}` || model.id === `lmstudio-${modelId}`,
    );
    if (downloadableModel) {
      return {
        label: downloadableModel.name,
        icon: downloadableModel.provider === "ollama" ? Cpu : Monitor,
      };
    }

    return {
      label: "Select model",
      icon: Bot,
    };
  };

  // Handle model change
  const handleModelChange = (value: string) => {
    console.log("Model changed to:", value);

    // Parse the value to get provider and model ID
    const [provider, ...modelParts] = value.split("-");
    const model = modelParts.join("-");

    if (!provider) return;

    // Handle cloud AI providers
    if (
      ["openai", "google", "anthropic", "mistral", "cohere"].includes(provider)
    ) {
      setModelProvider(
        provider as
          | "openai"
          | "google"
          | "anthropic"
          | "mistral"
          | "cohere",
      );
      setModelId(model);
      setSelectedModel(provider, model);
      console.log(`Saved to localStorage: ${provider}, ${model}`);
    }
    // Handle local providers
    else if (provider === "ollama") {
      setModelProvider("ollama");
      setModelId(model);
      setSelectedModel("ollama", model);
      console.log("Saved to localStorage: ollama,", model);
    } else if (provider === "lmstudio") {
      setModelProvider("lmstudio");
      setModelId(model);
      setSelectedModel("lmstudio", model);
      console.log("Saved to localStorage: lmstudio,", model);
    }
  };

  return (
    <div>
      {shouldShowLabel && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Text Model
        </label>
      )}
      <Select value={getCurrentModelValue()} onValueChange={handleModelChange}>
        <SelectTrigger className="overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            {(() => {
              const currentOption = getCurrentModelOption();
              const Icon = currentOption.icon;
              return <Icon className="h-4 w-4 flex-shrink-0" />;
            })()}
            <span className="truncate text-sm">
              {getCurrentModelOption().label}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {/* Loading indicator when fetching models */}
          {isLoading && !isInitialLoad && (
            <SelectGroup>
              <SelectLabel>Loading Models</SelectLabel>
              <SelectItem value="loading" disabled>
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm">
                      Refreshing models...
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      Checking for new models
                    </span>
                  </div>
                </div>
              </SelectItem>
            </SelectGroup>
          )}

          {/* Cloud AI Models - Grouped by Provider */}
          {(["openai", "google", "anthropic", "mistral", "cohere"] as const).map(
            (provider) => {
              const providerModels = AI_MODELS.filter(
                (m) => m.provider === provider,
              );
              if (providerModels.length === 0) return null;

              const Icon = getProviderIcon(provider);
              return (
                <SelectGroup key={provider}>
                  <SelectLabel>{getProviderDisplayName(provider)}</SelectLabel>
                  {providerModels.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={`${provider}-${model.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm">{model.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {model.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            },
          )}

          {/* Local Ollama Models */}
          {ollamaModels.length > 0 && (
            <SelectGroup>
              <SelectLabel>Local Ollama Models</SelectLabel>
              {ollamaModels.map((model) => {
                const option = createModelOption(model);
                const Icon = option.icon;
                return (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm">
                          {option.displayLabel}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          )}

          {/* Local LM Studio Models */}
          {lmStudioModels.length > 0 && (
            <SelectGroup>
              <SelectLabel>Local LM Studio Models</SelectLabel>
              {lmStudioModels.map((model) => {
                const option = createModelOption(model);
                const Icon = option.icon;
                return (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm">
                          {option.displayLabel}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          )}

          {/* Downloadable Ollama Models */}
          {showDownloadable && downloadableOllamaModels.length > 0 && (
            <SelectGroup>
              <SelectLabel>Downloadable Ollama Models</SelectLabel>
              {downloadableOllamaModels.map((model) => {
                const option = createModelOption(model, true);
                const Icon = option.icon;
                return (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm">
                          {option.displayLabel}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
