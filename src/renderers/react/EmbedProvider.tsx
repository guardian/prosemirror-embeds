import type { ReactElement } from "react";
import React, { Component } from "react";
import type { Validator } from "../../embedSpec";
import type { FieldNameToValueMap } from "../../nodeViews/helpers";
import type { TCommands } from "../../types/Commands";
import type { TConsumer } from "../../types/Consumer";
import type { FieldNameToNodeViewSpec, FieldSpec } from "../../types/Embed";
import type { TErrors } from "../../types/Errors";
import { EmbedWrapper } from "./EmbedWrapper";

const fieldErrors = <FSpec extends FieldSpec<string>>(
  fields: FieldNameToValueMap<FSpec>,
  errors: TErrors | null
) =>
  Object.keys(fields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: errors?.[key] ? errors[key] : [],
    }),
    {}
  );

type IProps<FSpec extends FieldSpec<string>> = {
  subscribe: (
    fn: (fields: FieldNameToValueMap<FSpec>, commands: TCommands) => void
  ) => void;
  commands: TCommands;
  fields: FieldNameToValueMap<FSpec>;
  onStateChange: (fields: FieldNameToValueMap<FSpec>) => void;
  validate: Validator<FSpec>;
  consumer: TConsumer<ReactElement, FSpec>;
  nestedEditors: FieldNameToNodeViewSpec<FSpec>;
};

type IState<FSpec extends FieldSpec<string>> = {
  commands: TCommands;
  fields: FieldNameToValueMap<FSpec>;
};

export class EmbedProvider<FSpec extends FieldSpec<string>> extends Component<
  IProps<FSpec>,
  IState<FSpec>
> {
  constructor(props: IProps<FSpec>) {
    super(props);

    this.updateFields = this.updateFields.bind(this);

    this.state = {
      commands: this.props.commands,
      fields: this.props.fields,
    };
  }

  componentDidMount() {
    this.props.subscribe((fields, commands) =>
      this.updateState(
        {
          commands,
          fields: {
            ...this.state.fields,
            ...fields,
          },
        },
        false
      )
    );
  }

  onStateChange(): void {
    this.props.onStateChange(this.state.fields);
  }

  updateState(state: Partial<IState<FSpec>>, notifyListeners: boolean): void {
    this.setState(
      { ...this.state, ...state },
      () => notifyListeners && this.onStateChange()
    );
  }

  updateFields(fields = {}): void {
    this.updateState(
      {
        fields: {
          ...this.state.fields,
          ...fields,
        },
      },
      true
    );
  }

  render() {
    const errors = fieldErrors(
      this.state.fields,
      this.props.validate(this.state.fields)
    );
    return (
      <EmbedWrapper name="Image" {...this.state.commands}>
        {this.props.consumer(
          this.state.fields,
          errors,
          this.updateFields,
          this.props.nestedEditors
        )}
      </EmbedWrapper>
    );
  }
}