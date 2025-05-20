using Avalonia.Data.Converters;
using System;
using System.Globalization;

namespace DairyFarm.Converters
{
    public class CapacityWarningConverter : IValueConverter
    {
        public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is int current && parameter is int max)
                return current >= max;
            return false;
        }

        public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}