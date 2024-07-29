import { View, Text, TextStyle, TouchableOpacity } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

interface DatePickerProps {
  showDatePicker: Boolean;
  datePickerDate: Date;
  textStyle?: TextStyle;
  openDatepicker: () => void;
  onChangeDate: (event: DateTimePickerEvent, selectedDate?: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  showDatePicker,
  datePickerDate,
  textStyle,
  openDatepicker,
  onChangeDate,
}) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <TouchableOpacity style={{ marginRight: 10 }} onPress={openDatepicker}>
        <Ionicons name="calendar-outline" size={24} color={"dark"} />
      </TouchableOpacity>
      <Text style={textStyle}>
        {datePickerDate && datePickerDate.toDateString()}
      </Text>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={datePickerDate}
          mode={"date"}
          is24Hour={true}
          onChange={onChangeDate}
        />
      )}
    </View>
  );
};

export default DatePicker;
