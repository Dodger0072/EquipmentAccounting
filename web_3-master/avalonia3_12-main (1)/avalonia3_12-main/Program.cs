using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.ReactiveUI;
using ReactiveUI;
using System;
/*
 * Создать иерархию классов, состоящую из одного базового класса и двух классов-наследников. 


На что следует обратить внимание (за невыполнение оценка будет снижена): 

Обязательно классы реализуются в отдельном модуле. 
Программа оформляется в соответствии с требованиями к разработке ПО (отступы, названия переменных и т.п.). 
В конструкторе класса могут и должны быть настроены значения полей и свойств класса, но инициализация 
значений должна быть вне класса. Например, не следует в конструкторе класса задавать в списке какие-то
значения, или какое-то имя студента, если они не передаются в конструктор через параметр.
Должен быть хотя-бы один вирутальный или абстрактный метод или свойство и их перекрытие.
Программа обязательно является оконным приложением.
Желательно придерживаться модели MVVM.

Базовый класс: живое существо (свойство: скорость перемещения, абстрактные методы: двигаться, стоять)
Производные классы: пантера, собака, черепаха. реализовать методы двигаться и стоять. 
При этом неоднократный вызов, например, метода двигаться увеличивает скорость до максимально 
возможного и наоборот - вызов метода стоять, уменьшает вплоть до остановки. 
У пантеры и собаки должен быть метод - подать голос (определяется вызовом соответствующих событий), 
и пантера может залезть на дерево.
 */

namespace DairyFarm;

sealed class Program
{
    // Initialization code. Don't use any Avalonia, third-party APIs or any
    // SynchronizationContext-reliant code before AppMain is called: things aren't initialized
    // yet and stuff might break.
    [STAThread]
    public static void Main(string[] args)
    {
        // Настроим главный поток для ReactiveUI
        RxApp.MainThreadScheduler = AvaloniaScheduler.Instance;

        // Стартуем приложение с этим жизненным циклом
        BuildAvaloniaApp()
            .StartWithClassicDesktopLifetime(args);
    }

    // Avalonia configuration, don't remove; also used by visual designer.
    public static AppBuilder BuildAvaloniaApp()
        => AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace()
            .UseReactiveUI(); // Подключаем ReactiveUI
}
