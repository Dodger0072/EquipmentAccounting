using Avalonia.Data.Converters;
using System;
using System.Globalization;

namespace DairyFarm.Converters
{
    public class BoolToColorConverter : IValueConverter
    {
        public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            return (value is bool busy) ? (busy ? "#FF5252" : "#4CAF50") : "#4CAF50";
        }

        public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}