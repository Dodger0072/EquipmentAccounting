using System;
using Avalonia.Controls;
using Avalonia.Controls.Templates;
using DairyFarm.ViewModels;

namespace DairyFarm;

public class ViewLocator : IDataTemplate
{
    public Control Build(object data)
    {
        var name = data.GetType().FullName!
            .Replace("ViewModel", "View", System.StringComparison.Ordinal);

        return Type.GetType(name) is Type type
            ? (Control)Activator.CreateInstance(type)!
            : new TextBlock { Text = $"View not found: {name}" };
    }

    public bool Match(object data) => data is ViewModelBase;
}